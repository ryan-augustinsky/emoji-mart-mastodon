const mapping = {
  name: 'a',
  unified: 'b',
  non_qualified: 'c',
  has_img_apple: 'd',
  has_img_google: 'e',
  has_img_twitter: 'f',
  has_img_mastodon: 'g',
  has_img_facebook: 'h',
  keywords: 'j',
  sheet: 'k',
  emoticons: 'l',
  text: 'm',
  short_names: 'n',
  added_in: 'o',
}

const buildSearch = (emoji) => {
  const search = []

  var addToSearch = (strings, split) => {
    if (!strings) {
      return
    }

    ;(Array.isArray(strings) ? strings : [strings]).forEach((string) => {
      ;(split ? string.split(/[-|_|\s]+/) : [string]).forEach((s) => {
        s = s.toLowerCase()

        if (search.indexOf(s) == -1) {
          search.push(s)
        }
      })
    })
  }

  addToSearch(emoji.short_names, true)
  addToSearch(emoji.name, true)
  addToSearch(emoji.keywords, false)
  addToSearch(emoji.emoticons, false)

  return search.join(',')
}

const compress = (emoji) => {
  emoji.short_names = emoji.short_names.filter((short_name) => {
    return short_name !== emoji.short_name
  })
  delete emoji.short_name

  emoji.sheet = [emoji.sheet_x, emoji.sheet_y]
  delete emoji.sheet_x
  delete emoji.sheet_y

  emoji.added_in = parseInt(emoji.added_in)
  if (emoji.added_in === 6) {
    delete emoji.added_in
  }

  for (let key in mapping) {
    emoji[mapping[key]] = emoji[key]
    delete emoji[key]
  }

  for (let key in emoji) {
    let value = emoji[key]

    if (Array.isArray(value) && !value.length) {
      delete emoji[key]
    } else if (typeof value === 'string' && !value.length) {
      delete emoji[key]
    } else if (value === null) {
      delete emoji[key]
    }
  }
}

const minifyForMastodon = (data, setCompressed=true) => {
  if (setCompressed) {
    data.compressed = true
  }

  const minifyEmoji = (emoji) => {
    if (emoji.skin_variations) {
      emoji.skin_variations = minifyForMastodon({ "emojis": emoji.skin_variations }, false)["emojis"]
    }

    const deleteKeys = ['has_img_apple', 'has_img_google', 'has_img_twitter', 'has_img_mastodon', 'has_img_facebook', 'added_in', 'image', 'non_qualified']
    // delete the keys that are not needed for mastodon inside the emoji object
    deleteKeys.forEach((key) => {
      delete emoji[key]
    });

    // now get the mapped values using the deleteKeys array
    const mappedDeleteKeys = deleteKeys.map((key) => {
      return mapping[key]
    });

    // now delete the mapped keys
    mappedDeleteKeys.forEach((key) => {
      delete emoji[key]
    });

    console.log(emoji)
    return emoji
  }

  for (let id in data.emojis) {
    let emoji = data.emojis[id]
    // if emoji has a key called skin_variations, then recursively call minifyEmoji on each of its skin_variations
    emoji = minifyEmoji(emoji)
  }

  return data
}

const uncompress = (data) => {
  data.compressed = false

  for (let id in data.emojis) {
    let emoji = data.emojis[id]

    for (let key in mapping) {
      emoji[key] = emoji[mapping[key]]
      delete emoji[mapping[key]]
    }

    if (!emoji.short_names) emoji.short_names = []
    emoji.short_names.unshift(id)

    emoji.sheet_x = emoji.sheet[0]
    emoji.sheet_y = emoji.sheet[1]
    delete emoji.sheet

    if (!emoji.text) emoji.text = ''

    if (!emoji.added_in) emoji.added_in = 6
    emoji.added_in = emoji.added_in.toFixed(1)

    emoji.search = buildSearch(emoji)
  }
}

export { buildSearch, compress, minifyForMastodon, uncompress }
