const build = require('./build')
const sets = ['apple', 'facebook', 'google', 'twitter', 'mastodon']

build({ output: 'data/all.json', minifyForMastodon: false })

sets.forEach((set) => {
  build({
    output: `data/${set}.json`,
    sets: [set],
    minifyForMastodon: true,
  })
})
