/* Minimal Web Push (RFC 8291 encryption + RFC 8292 VAPID) built entirely on
   WebCrypto, because Cloudflare Workers can't use Node's 'web-push' package.
   Sends one notification to one subscription; call it once per recipient. */

function b64urlToBytes(s){
  s = s.replace(/-/g,"+").replace(/_/g,"/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(buf){
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function concat(...arrs){
  const len = arrs.reduce((a,b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let o = 0; for (const a of arrs){ out.set(a, o); o += a.length; }
  return out;
}

async function importVapidPrivateKey(d, x, y){
  return crypto.subtle.importKey(
    "jwk",
    {kty:"EC", crv:"P-256", d, x, y, ext:true, key_ops:["sign"]},
    {name:"ECDSA", namedCurve:"P-256"},
    false, ["sign"]
  );
}

async function vapidHeader(endpoint, vapid){
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now()/1000) + 12*3600;
  const header = {typ:"JWT", alg:"ES256"};
  const claims = {aud, exp, sub: vapid.subject};
  const enc = s => bytesToB64url(new TextEncoder().encode(JSON.stringify(s)));
  const unsigned = enc(header) + "." + enc(claims);
  const key = await importVapidPrivateKey(vapid.d, vapid.x, vapid.y);
  const sig = await crypto.subtle.sign(
    {name:"ECDSA", hash:"SHA-256"}, key, new TextEncoder().encode(unsigned)
  );
  const jwt = unsigned + "." + bytesToB64url(sig);
  return {
    Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
    "Crypto-Key": `p256ecdsa=${vapid.publicKey}`
  };
}

/* RFC 8291: encrypt the notification body to the subscriber's keys */
async function encryptPayload(plaintext, p256dhB64, authB64){
  const clientPub = b64urlToBytes(p256dhB64);
  const authSecret = b64urlToBytes(authB64);

  const serverKeys = await crypto.subtle.generateKey(
    {name:"ECDH", namedCurve:"P-256"}, true, ["deriveBits"]
  );
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverKeys.publicKey));

  const clientKey = await crypto.subtle.importKey(
    "raw", clientPub, {name:"ECDH", namedCurve:"P-256"}, false, []
  );
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    {name:"ECDH", public: clientKey}, serverKeys.privateKey, 256
  ));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  async function hkdf(ikm, salt, info, len){
    const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      {name:"HKDF", hash:"SHA-256", salt, info}, key, len*8
    );
    return new Uint8Array(bits);
  }

  const authInfo = new TextEncoder().encode("WebPush: info\0");
  const prk = await hkdf(sharedSecret, authSecret, concat(authInfo, clientPub, serverPubRaw), 32);

  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const cek = await hkdf(prk, salt, cekInfo, 16);
  const nonce = await hkdf(prk, salt, nonceInfo, 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const padded = concat(new TextEncoder().encode(plaintext), new Uint8Array([2])); // delimiter + no padding
  const cipher = new Uint8Array(await crypto.subtle.encrypt(
    {name:"AES-GCM", iv: nonce}, aesKey, padded
  ));

  // aes128gcm header per RFC 8188: salt(16) | rs(4, big-endian) | idlen(1) | keyid
  const rsBE = new Uint8Array(4);
  new DataView(rsBE.buffer).setUint32(0, 4096);
  const fullHeader = concat(salt, rsBE, new Uint8Array([serverPubRaw.length]), serverPubRaw);

  return concat(fullHeader, cipher);
}

/* Sends one push message. `subscription` is {endpoint, keys:{p256dh, auth}}.
   `vapid` is {publicKey, d, x, y, subject} — see index.js for where these come from.
   Returns {ok, status} — a 404/410 status means the subscription is dead and
   should be deleted, which the caller is responsible for. */
export async function sendPush(subscription, payloadObj, vapid){
  const body = await encryptPayload(JSON.stringify(payloadObj), subscription.keys.p256dh, subscription.keys.auth);
  const headers = await vapidHeader(subscription.endpoint, vapid);
  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400"
    },
    body
  });
  return {ok: res.ok, status: res.status};
}
