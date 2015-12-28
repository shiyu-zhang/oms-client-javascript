How to run conference sample
============================

1. Run `npm install`.
2. Edit basicServer.js line 42. Replace server ID, server key and MCU URL with the correct value.
3. Copy your SSL server certificate to cert/certificate.pfx.
4. Run `initcert.js` to generate a keystore file which contains encrypted SSL server's passphase.
5. Run `node basicServer.js` to start conference sample. By default, it license on port 3001(insecure) and 3004(secure).
6. Open a browser and navigate to http://\<hostname\>:3001/ or https://\<hostname\>:3004/.