var run = require('parallel-webpack').run
const config = require.resolve('./webpack.app.config')
run(config, {
  watch: true,
  stats: true, // defaults to false
  maxConcurrentWorkers: 2, // use 2 workers
})
// const compiler = webpack(config(env))
// compiler.watch({}, (err, stats) => {
//   if (err) console.log(err)
// })
