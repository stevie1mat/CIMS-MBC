const { getUsers } = require('./src/app/actions/users.js')

async function run() {
  const u = await getUsers()
  console.log(u)
}
run()
