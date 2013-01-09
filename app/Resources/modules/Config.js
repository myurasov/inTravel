/**
 * Config
 */

Project.Config = new mym.Configuration({
  // channel name
  channel: Project.Utils.createUID(3),

  // timeout to publish messages
  publishTimeout: 15, // [s]

  // background service
  backgroundService: true,

  // last asked for rating date [timestamp]
  lastAskedForRatingDate: Date.now(),

  // asked for rating counters
  askedForRatingNo: 0,
  askedForRatingYes: 0,
  askedForRatingDone: 0,

  // ignored client uids
  ignoredClientUIDs: [],

  // watchers
  watchers: [],

  // title bar bg color
  _barColor: "#f5a00e"

}, "Config");