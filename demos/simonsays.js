var tpad = require('../lib/tpad')
  , EventEmitter = require('events').EventEmitter
  ;
tpad.init(function (err, tpad) {
  if (err) throw err

  var red = '#CA35FF'
  
  var games = 
    [ [2, 500, 3, 750, 1]
    , [3, 600, 2, 750, 0, 800, 1] //, 400, 2, 800, 0]
    ]
  
  var simon = new EventEmitter()
  
  
  tpad.each(function (pad, index) {
    pad.on('press', function (pad) {
      pad.color(red)
    })
    pad.on('depress', function (pad) {
      pad.color('000000')
      simon.emit('active', pad)
    })
  })
  
  function reset (g) {
    console.log('reset')
    if (!g) g = 0
    setTimeout(function () { // workaround for clearall() being faster than pressure sense
      allclear()
      simon.removeAllListeners()
      tpad.each(function (pad) { pad.color(red) })
      setTimeout(function () {
        allclear()
        startGame(g)
      }, 1000)
    }, 30)
    
  }
  
  
  function allclear () {
    console.log('clear')
    tpad.each(function (pad) {
      pad.color('000000')
    })
  }
  
  function startGame(g) {
    simon.once('active', function () {    
      setTimeout(function () {
        var game = games[g]
          , pos = 0
          ;
        function start () {
          pos = 0
          var timeout
          simon.on('active', function (pad) {
            clearTimeout(timeout)

            console.log('pos', pos)
            if (pad.index !== game[pos]) {
              console.log('wrong key', pos, game[pos])
              return reset(0)
            }
            pos = pos + 2
            
            if (pos >= game.length) {
              if (games[g+1]) {
                return reset(g+1)
              } else {
                  return tpad.each(function (pad) { pad.color(red) })
              }
            }
            
            timeout = setTimeout(function () {
              console.log('timeout')
              reset()
            }, 1000)
          })
        }
        function demo () {
          if (pos >= game.length) {
            return start()
          }
          tpad(game[pos]).color(red)
          setTimeout(function () {
            pos = pos + 2
            allclear()
            demo()
          }, game[pos+1] || 300)
        }
        setTimeout(function() {
          allclear()
          setTimeout(function () {
            demo()
          }, 400)
        }, 30)
        
      }, 300)
    })
  }
  
  reset(0)
})
