require('../app_api/config/environment');
const { connect, mongoose } = require('../app_api/models/db');
const User = require('../app_api/models/user');
const { createInterface } = require('readline/promises');
async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const name = (await rl.question('Administrator name: ')).trim();
    const email = (await rl.question('Administrator email: ')).trim().toLowerCase();
    // Mute terminal echo while the password is entered.
    const originalWrite = rl._writeToOutput;
    const passwordPromise = rl.question('Password (12 to 128 characters): ');
    rl._writeToOutput = () => {};
    const password = await passwordPromise;
    rl._writeToOutput = originalWrite;
    process.stdout.write('\n');
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
      throw new Error('Enter a name, valid email, and password of 12 to 128 characters.');
    }
    await connect();
    if (await User.exists({ email })) throw new Error('This account already exists. No changes were made.');
    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    console.log('Administrator created. You can now sign in to the Angular app.');
  } finally { rl.close(); await mongoose.disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
