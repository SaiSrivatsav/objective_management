// const cds = require('@sap/cds');
// const net = require('net');
// const hana = require('@sap/hana-client');

// async function testExternalHanaConnection() {
//   // --- Hardcoded details (replace with your actual values) ---
//   const host = 'smf-hana-comm-sls-1b24.smf.uc.int';
//   const port = 30113;
//   const user = 'PS_SMF0934SLS';
//   const password = 'Spectrum2020';
//   const schema = 'EXT';

//   console.log(`Testing connectivity to external HANA DB at ${host}:${port} ...`);

//   // --- Step 1: TCP reachability test ---
//   await new Promise((resolve, reject) => {
//     const socket = new net.Socket();
//     socket.setTimeout(8000);

//     socket.connect(port, host, () => {
//       console.log(`✅ TCP connection successful to ${host}:${port}`);
//       socket.destroy();
//       resolve();
//     });

//     socket.on('error', (err) => {
//       console.error(`❌ TCP connection failed: ${err.message}`);
//       reject(err);
//     });

//     socket.on('timeout', () => {
//       console.error('❌ TCP connection timed out');
//       reject(new Error('timeout'));
//     });
//   });

//   // --- Step 2: DB authentication test ---
//   try {
//     console.log('Attempting HANA DB login ...');
//     const conn = hana.createConnection();
//     conn.connect({
//       serverNode: `${host}:${port}`,
//       uid: user,
//       pwd: password,
//       encrypt: true,
//       sslValidateCertificate: false, // set to true if valid cert chain exists
//       CURRENTSCHEMA: schema
//     });

//     const result = conn.exec('SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY');
//     console.log('✅ HANA login successful:', result);

//     conn.disconnect();
//   } catch (err) {
//     console.error('❌ HANA login failed:', err.message);
//   }
// }

// (async () => {
//   try {
//     await testExternalHanaConnection();
//   } catch (err) {
//     console.error('External HANA connectivity test failed:', err.message);
//   }

//   // Start CAP service as usual
//   const app = cds.server();
// })();