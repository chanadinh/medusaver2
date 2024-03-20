require('dotenv').config();
const ExtendedClient = require('./class/ExtendedClient');
const { DisTube } = require('distube')
const { EmbedBuilder } = require('discord.js');
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const client = new ExtendedClient();
const Format = Intl.NumberFormat();
let spotifyOptions = {
    parallel: true,
    emitEventsAfterFetching: false,
};
client.distube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
      new SpotifyPlugin({
        emitEventsAfterFetching: true
      }),
      new SoundCloudPlugin(),
      new YtDlpPlugin()
    ]
})
const status = queue =>
  `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
client.distube
  .on('playSong', (queue, song) =>
    queue.textChannel.send(
      `| Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${
        song.user
      }\n${status(queue)}`
    )
  )
  .on('addSong', (queue, song) =>
    queue.textChannel.send(
      `${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    )
  )
  .on('addList', (queue, playlist) =>
    queue.textChannel.send(
      `${client.emotes.success} | Added \`${playlist.name}\` playlist (${
        playlist.songs.length
      } songs) to queue\n${status(queue)}`
    )
  )
  .on('error', (channel, e) => {
    if (channel) channel.send(`${client.emotes.error} | An error encountered: ${e.toString().slice(0, 1974)}`)
    else console.error(e)
  })
  .on('empty', channel => channel.send('Voice channel is empty! Leaving the channel...'))
  .on('searchNoResult', (message, query) =>
    message.channel.send(`${client.emotes.error} | No result found for \`${query}\`!`)
  )
  .on('finish', queue => queue.textChannel.send('Finished!'))
  // DisTubeOptions.searchSongs = true
.on("searchResult", (message, result) => {
    let i = 0
    message.channel.send(
        `**Choose an option from below**\n${result
            .map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
            .join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`
    )
})
.on("searchCancel", message => message.channel.send(`${client.emotes.error} | Searching canceled`))
.on("searchInvalidAnswer", message =>
    message.channel.send(
        `${client.emotes.error} | Invalid answer! You have to enter the number in the range of the results`
    )
)
// .on("searchDone", () => {})
client.start();

// Handles errors and avoids crashes, better to not remove them.
process.env.YTSR_NO_UPDATE = "1";
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);