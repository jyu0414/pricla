let state = 0;
var selected = 0;
let canvas = document.getElementById('canvas');
let imageCapture;
var event = 'ontouchstart' in window ? 'touchstart' : 'click';

$(function () {
  canvas.width = $("#canvas").width();
  canvas.height = $("#canvas").height();
  initiate();
});

function initiate() {
  $("#video").hide();
  $("#canvas").show();
  $("#openingSound").get(0).load();
  $("#openingSound").get(0).play();
  state = 0;
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var initBg = new Image();
  initBg.src = "startBg.jpg";
  initBg.onload = function () {
    let imgWidth = canvas.height / initBg.height * initBg.width;
    ctx.drawImage(initBg, (canvas.width - imgWidth) / 2, 0, imgWidth, canvas.height);
  }
}

function selectView(e) {
  console.log(selected);
  state = 1;
  $("#video").hide();
  $("#canvas").show();

  if (e) {
    selected = 0;
    setTimeout(function () {
      $("#frameSound").get(0).load();
      $("#frameSound").get(0).play();
    }, 2000);
  }

  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  var initBg = new Image();
  initBg.src = "bgImage.jpg";
  initBg.onload = function () {
    ctx.drawImage(initBg, 0, 0, canvas.width, canvas.width / initBg.width * initBg.height);

    ctx.font = "38px serif";
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    ctx.fillText("好きなフレームを選んでね", 50, 80);

    ctx.strokeStyle = "#ff0081";
    ctx.strokeRect(70 + selected * ((canvas.width - 140) / 3), 120, (canvas.width - 140) / 3 - 20, canvas.height - 160);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(70 + i * ((canvas.width - 140) / 3), 120, (canvas.width - 140) / 3 - 20, canvas.height - 160);
      let frame = new Image();
      frame.src = "frame" + (i + 1) + ".gif";
      frame.onload = function () {
        let width = (canvas.width - 140) / 3 - 20;
        let height = width / frame.width * frame.height;
        ctx.drawImage(frame, 70 + i * ((canvas.width - 140) / 3), 120 + (canvas.height - 160 - height) / 2, width, height);
      }
    }

  }
}

function cameraView() {
  console.log(selected);
  state = 2;
  $("#video").show();
  $("#canvas").show();
  $("#pauseSound").get(0).load();
  $("#pauseSound").get(0).play();
  showCamera();
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ff0081";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height / 2, 150, 200, 0, 0, 2 * Math.PI);
  ctx.stroke();
  console.log(selected);
}

let countDownvalue = 3;
let countDownCircleTheta = 0;

function countDown() {
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ff0081";
  ctx.lineWidth = 5;
  ctx.beginPath(); canvas.width / 2, canvas.height / 2
  ctx.ellipse(canvas.width / 2, canvas.height / 2, 150, 200, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 50;
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, countDownCircleTheta)
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "italic bold 150px sans-serif";
  ctx.lineWidth = 10;
  ctx.fillText(countDownvalue, canvas.width / 2 - 20, canvas.height / 2 + 50);

  countDownCircleTheta += 3.1415 * 2 * 0.05;
  if (countDownCircleTheta > 3.1415 * 2) {
    if (countDownvalue == 1) {
      console.log(selected);
      printView();
    }
    else {
      countDownvalue -= 1;
      countDownCircleTheta = 0;
      setTimeout(countDown, 50);
    }
  } else {
    setTimeout(countDown, 50);
  }
}

function printView() {
  console.log(selected);
  state = 3;
  $("#finishSound").get(0).load();
  $("#finishSound").get(0).play();
  $("#shutter").get(0).load();
  $("#shutter").get(0).play();
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  $("#video").hide();
  $("#canvas").show();

  setTimeout(function () {
    console.log(selected);

    imageCapture.takePhoto()
      .then(blob => {

        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4, this.status == "200") {
            let url = window.URL.createObjectURL(this.response);
            /*printJS({
              printable: url,
              type: 'image',
              scanStyles: false,
              onPrintDialogClose: printingView(),
              imageStyle: 'width:100mm;height:148mm,margin:0;padding:0;'
            });*/
            
            printJS({
              printable: "<html><body><img src='"+url+"'/></body></html>",
              type: 'raw-html',
              style: 'html,body,img {margin: 0;} html,body{height:146mm; overflow: hidden;} img{width:100mm; height: 148mm;}',
              scanStyles: false,
              onPrintDialogClose: printingView()
            });
          }
        });

        xhr.open("POST", "https://pricla.herokuapp.com");
        xhr.setRequestHeader("frame", "1");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.withCredentials = false;
        xhr.responseType = "blob";
        xhr.send(blob);

        return createImageBitmap(blob)
      }).then(imageBitmap => {
        let video = document.getElementById("video");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let marginSide = (canvas.width - video.videoWidth) / 2;
        ctx.drawImage(imageBitmap, marginSide, (canvas.height - video.videoHeight) / 2, video.videoWidth, video.videoHeight);

      })

    /*let f = new Image();
    f.src = "frame" + (selected + 1) + ".gif";
    f.onload = function() {
      let video = document.getElementById("video");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "yellow";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      let marginSide = (canvas.width - video.videoWidth)/2;
      let marginSideRatio = marginSide / canvas.width;
      ctx.drawImage(document.getElementById("video"),marginSide,(canvas.height - video.videoHeight)/2,video.videoWidth,video.videoHeight);
      ctx.drawImage(f,marginSide,(canvas.height - video.videoHeight)/2,video.videoWidth,video.videoHeight);
      printJS({
        printable: [canvas.toDataURL(),canvas.toDataURL(),canvas.toDataURL(),canvas.toDataURL(),canvas.toDataURL(),canvas.toDataURL()],
        type:'image',
        showModal:false,
        onPrintDialogClose: () => printingView(),
        style: "img {width: "+2.4 + 2.4 * marginSideRatio * 2+"cm; height: 1.5cm; margin-left: " + 0.7 - 2.4 * marginSideRatio + "cm; margin-bottom: 0.8cm;}"
        });
    }*/
  }, 150);
}

function printingView() {
  state = 4;
  let ctx = canvas.getContext("2d");

  $("#loadingBg").get(0).load();
  $("#loadingBg").get(0).play();

  setTimeout(function () {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let bg = new Image();
    bg.src = "loadingBg.jpg";
    bg.onload = function () {
      let imgWidth = canvas.height / bg.height * bg.width;
      ctx.drawImage(bg, (canvas.width - imgWidth) / 2, 0, imgWidth, canvas.height);
    }



    setTimeout(function () { initiate() }, 3000);
  }, 1000);

}

$(".btn").on(event, function () {
  $("#buttonSound").get(0).load();
  $("#buttonSound").get(0).play();
});

$("#enterButton").on(event, function () {
  switch (state) {
    case 0:
      $("#openingSound").get(0).load();
      $("#openingSound").get(0).play();
      selectView(true);
      break;
    case 1:
      cameraView();
      break;
    case 2:
      countDownvalue = 3;
      countDownCircleTheta = 0;
      console.log(selected);
      countDown();
      $("#countDownSound").get(0).load();
      $("#countDownSound").get(0).play();
      break;
  }

});

$("#cancelButton").on(event, function () {
  switch (state) {
    case 1:
      initiate();
      break;
    case 2:
      selectView(true);
      break;
  }
});

$("#rightButton").on(event, function () {
  switch (state) {
    case 1:
      if (selected < 2) selected += 1;
      selectView();
      break;


  }
});

$("#leftButton").on(event, function () {
  switch (state) {
    case 1:
      if (selected > 0) selected -= 1;
      selectView();
      break;

  }
});

function showCamera() {
  var video = document.getElementById("video");
  // getUserMedia によるカメラ映像の取得
  var media = navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  //リアルタイムに再生（ストリーミング）させるためにビデオタグに流し込む
  media.then((stream) => {
    video.srcObject = stream;
    let videoTrack = stream.getVideoTracks()[0]
    imageCapture = new ImageCapture(videoTrack)
  });
}