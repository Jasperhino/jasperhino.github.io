$(document).ready(function () {

  var player = SC.Widget($('iframe.sc-widget')[0]);
  var pOffset = $('.player').offset();
  var pWidth = $('.player').width();
  var scrub;

  player.bind(SC.Widget.Events.READY, function () {
    setInfo();
    player.play();
  }); //Set info on load

  player.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
    if (e.relativePosition < 0.003) {
      setInfo();
    }
    //Event listener when track is playing
    $('.position').css('width', (e.relativePosition * 100) + "%");
  });

  $('.player').mousemove(function (e) { //Get position of mouse for scrubbing
    scrub = (e.pageX - pOffset.left);
  });

  $(document).on('keydown', function (e) {
    switch (e.keyCode) {
      case 32:
        player.toggle();
        break;
      case 39:
        player.next();
        break;
      case 37:
        player.prev();
        break;
    }
  });

  //prevent space scrolling
  window.addEventListener('keydown', function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
      e.preventDefault();
    }
  });

  $('.player').click(function () { //Use the position to seek when clicked
    $('.position').css('width', scrub + "px");
    var seek = player.duration * (scrub / pWidth);

    //Seeking to the start would be a previous?
    if (seek < player.duration * .05) {
      player.prev();
    } else if (seek > player.duration * .99) {
      player.next();
    } else {
      player.seekTo(seek);
    }

  });

  function setInfo() {
    player.getCurrentSound(function (song) {

      // Soundcloud just borked this api endpoint, hence this hack :/
      var waveformPng =
        song.waveform_url
        .replace('json', 'png')
        .replace('wis', 'w1');

      fetch(song.waveform_url)
        .then(res => res.json())
        .then((json) => drawWave(json))
        .catch(err => console.error(err));

      var artworkUrl = song.artwork_url || '';

      console.log(song);

      //$('.waveform').css('background-image', "url('" + waveformPng + "')");
      //$('.player').css('background-image', "url('" + artworkUrl.replace('-large', '-t500x500') + "')");

      var info = song.title;
      $('.info').html(info);

      player.current = song;
    });

    player.getDuration(function (value) {
      player.duration = value;
    });

    player.isPaused(function (bool) {
      player.getPaused = bool;
    });
  }

  function drawWave(json) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    fix_dpi(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var WIDTH = json.width;
    var HEIGHT = json.height;
    var dataArray = json.samples;
    var bufferLength = json.samples.length;
    var barWidth = (WIDTH / bufferLength) * 1;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i+=4) {
      barHeight = dataArray[i];
      ctx.fillStyle = "#fff";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  function fix_dpi(canvas) {
    //create a style object that returns width and height
    let style = {
      height() {
        return +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
      },
      width() {
        return +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);
      }
    }
    //set the correct attributes for a crystal clear image!
    dpi = window.devicePixelRatio;
    canvas.setAttribute('width', style.width() * dpi);
    canvas.setAttribute('height', style.height() * dpi);
  }

});