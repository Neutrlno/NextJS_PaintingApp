
$("#modifywheel").click(function() {
    $('html, body').animate({
        scrollTop: $("#wheelBuilder").offset().top
    }, 1000);
  });
  
  var colors = ["#ffff00","#000000"];
  var restaurants = ["Watch a great film", "Read a book", "Sing or play music", "Yoga", "Phone an old friend", "Write", "Garden (indoor/outdoor)", "Art project", "Watch a terrible film", "Play a game", "Outside time (6' from others)", "Hone a new skill", "Phone your family", "Send a letter", "Prepare food", "Dance"];		
  var intTextBox=100;
  var choiceCount=100;
  var numcolors = colors.length;
  
  
  //FUNCTION TO ADD TEXT BOX ELEMENT
  function addElement()
  {
  if (choiceCount < 100 && intTextBox < 200) {
    intTextBox = intTextBox + 1;
    choiceCount = choiceCount+1;
    var contentID = document.getElementById('txtChoices');
    var newTBDiv = document.createElement('div');
    newTBDiv.setAttribute('id','strText'+intTextBox);
    newTBDiv.setAttribute('class','input-group');
    newTBDiv.innerHTML = "<input onfocus='addElementIfNeeded("+ intTextBox + ")' class='form-control' type='text' id='c" + intTextBox + "' name='c" + intTextBox + "'/><span class='input-group-btn' id='basic-addon2'><input type='button' value='X' onclick='removeElementID("+intTextBox+");' tabindex='1000'></span>";
    contentID.appendChild(newTBDiv);
  } else {
    alert("Number of wheel slices cannot exceed 100. Visit our Business page to purchase a wheel beyond 100 slices.");
  }
  }
  
  function addElementIfNeeded(id) {
  if (id == intTextBox) {
    addElement();
  }
  }
  
  //FUNCTION TO REMOVE TEXT BOX ELEMENT
  function removeElement()
  {
  if(intTextBox != 0)
  {
  var contentID = document.getElementById('txtChoices');
  contentID.removeChild(document.getElementById('strText'+intTextBox));
  //intTextBox = intTextBox-1; this would break it
  choiceCount = choiceCount-1;
  }
  }
  
  function removeElementID(cnum)
  {
  var contentID = document.getElementById('txtChoices');
  contentID.removeChild(document.getElementById('strText'+cnum));
  //intTextBox = intTextBox-1; this would break it
  choiceCount = choiceCount-1;
  }
    
  intTextBox = 5;  
  choiceCount = intTextBox;
  var weights = [];		
        function setWeightedVariables() {
            numOptionsWeighted = restaurants.length;
            if (weights.length > 0) {
                for (var i = 0; i < weights.length; i++) {
                    numOptionsWeighted += weights[i] - 1;
                }
            }
            arc = Math.PI / (numOptionsWeighted / 2);
            wedgeAngle = Math.PI * 2 / numOptionsWeighted;
        }        
                
  var numcolors = colors.length;
  var numoptions = restaurants.length;
        
        var numOptionsWeighted;
        var arc;
        
        setWeightedVariables();
    
        if (numOptionsWeighted % 2 == 1) {
            isOddNumberOfChoices = true;
            isFirstSpinCycle = true;
        }
  
  var canv = document.getElementById("wheelcanvas");
  var canvTop = document.getElementById("wheelcanvastop");
  
  
  
  var isMobile = false;
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  isMobile = true;
  }
  
  if (isMobile) {
    canvasWidth = canv.width;
    var mutebutton = document.getElementById('mutebutton');
    toggleMute(mutebutton);
  }
  if (window.frameElement) {
    maxWidth = window.frameElement.offsetWidth;
    maxHeight = window.frameElement.offsetHeight;
  }
  var minDimension = Math.min(maxWidth, maxHeight);
  
  if (!isMobile) {  
  var canvasWidth = 500;		canv.width = canvasWidth;
    canv.height = canvasWidth;
    wheelSize = canvasWidth;
    canvTop.width = canvasWidth;
    canvTop.height = canvasWidth;
    var canvOuter = document.getElementById('wheelcanvasOuter');
    canvOuter.style.width = canvasWidth + "px";
    canvOuter.style.height = canvasWidth + "px";
    
    var context = canvTop.getContext('2d');
      var imageObj = new Image();
  
      imageObj.onload = function() {
        context.drawImage(imageObj, 0,0, canvasWidth, canvasWidth);
      };
      imageObj.src = '/images/WD-Click-to-Spin.png';
         
  }
  
  var wheelRadius = wheelSize * 0.5;
  var outsideRadius = wheelRadius;
  var textRadius = wheelRadius * 0.9;
  var insideRadius = wheelRadius *0.1;
  
  function wheelMouseDown(e) {
    clearTopCanvas();
  drawArrow();
   var wheeldiv = document.getElementById("wheelcanvastop");
    midX = wheeldiv.offsetLeft+wheelRadius+wheeldiv.offsetParent.offsetLeft+wheeldiv.offsetParent.offsetParent.offsetLeft;
   midY = wheeldiv.offsetTop+wheelRadius+wheeldiv.offsetParent.offsetTop+wheeldiv.offsetParent.offsetParent.offsetTop;
   lastX=e.clientX;
   lastY=e.clientY;
    isMouseDown = true;
  }
  
  function drawRouletteWheel() {
    var canvas = document.getElementById("wheelcanvas");
    if (canvas.getContext) {
    
      ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0,canv.width,canv.height);
    ctx.strokeStyle = "black";
      ctx.lineWidth = 0;
      ctx.translate( canvas.width/2 , canvas.height/2 );
      ctx.font = 'bold 12px sans-serif';
            var weightedIndex = 0;
  
      for(var i = 0; i < numoptions; i++) {
          var weightedArc = arc;
          var weight = 1;
          if (weights.length > i) {
              weight = weights[i];
              weightedArc = arc * weight;
          }
         
        var angle = startAngle + weightedIndex * arc;
        ctx.fillStyle = colors[i%numcolors];
        ctx.beginPath();
        var endAngle = angle + weightedArc;
        // Chrome 43.0.2357.81 m arc issue
        if (endAngle > 6.282 && endAngle < 6.284) {
            endAngle = 6.282;
        }
        ctx.arc(0,0, outsideRadius, angle, endAngle, false);
        ctx.arc(0,0, insideRadius, endAngle, angle, true);
        ctx.fill();
        ctx.save();
      
      
      if (i%2 == 0) {ctx.fillStyle = "#000000"; } else if (i%2 == 1) {ctx.fillStyle = "#ffffff"; } 			var angHalfArc = angle + weightedArc * 0.5 - 0.04;
        ctx.translate(Math.cos(angHalfArc) * textRadius, Math.sin(angHalfArc) * textRadius);
        ctx.rotate(angHalfArc + Math.PI);
        var text = restaurants[i];
      
      ctx.font = 'bold '+choiceTextSize[i]+'px sans-serif';
     
     textHWidth = ctx.measureText(text).width;
    if (textHWidth > textRadius - 30) {
        text = text.substring(0,27) + "...";	
    }
     
     
      ctx.fillText(text, 0, 0);        weightedIndex += weight;
        ctx.restore();
      } 
      
    drawArrow();
    }
  }
  
  function spin() {
    clearTopCanvas();
  drawArrow();
    var minTimeToSpin = 5;
    var timeRange = 4;
   var minAngleToStartRotating = 20;
   var angleRange = 30;
    spinTime = 0;
    spinTimeTotal = minTimeToSpin * 1000;
    angleSinceBeep = 0;
  timeSinceBeep = 0;
  
   slowDown = false;
  spinAngleStart = Math.random() * angleRange + minAngleToStartRotating; 
  setWheelImageSource();
  rotateWheelImage();
  }
  
  function setChoiceFontSizes() {
  // get the font size of each choice
   var canvas = document.getElementById("wheelcanvas");
    if (canvas.getContext) {
      ctx = canvas.getContext("2d");
    choiceTextSize = [];
    for(var i = 0; i < numoptions; i++) {
      var text = restaurants[i];
      ctx.font = 'bold 18px sans-serif'; 
      var textHWidth = ctx.measureText(text).width;
      if (textHWidth > textRadius - 30) {
        ctx.font = 'bold 15px sans-serif';
        textHWidth = ctx.measureText(text).width;
        if (textHWidth > textRadius - 30) {
          choiceTextSize.push("12");
        } else {
          choiceTextSize.push("15");
        }
      } else {
        choiceTextSize.push("18");
      }
    }
    
              
    
  }
  }
  
    
  function stopRotateWheelImage() {
    clearTimeout(spinTimeout);
  
  var choice = getCurrentChoiceWithWeights();
  var text = choice.text;
  var index = choice.index;
   
  var canvasTop = document.getElementById("wheelcanvastop");
  if (canvasTop.getContext) {
    
    ctxTop = canvasTop.getContext("2d");
     
    ctxTop.font = 'bold 30px sans-serif';
    var textHWidth = ctxTop.measureText(text).width*0.5;
    if (textHWidth > wheelRadius) {
      ctxTop.font = 'bold 12px sans-serif';
      textHWidth = ctxTop.measureText(text).width*0.5;
    }
                 
                var imageObj = new Image();
  
                imageObj.onload = function() {
                       ctxTop.drawImage(imageObj, 0, 0, canvasWidth, canvasWidth);
                       ctxTop.fillStyle = "white";
                       ctxTop.fillText(text, canvasWidth/2 - textHWidth, canvasWidth/2 + 10);
                };
                imageObj.src = '/images/stop-message-gradient-500.png';
                if (!isMuted) {
                    var audioFinal = document.getElementById("wheelAudioFinal");
                    audioFinal.play();
                }
  }
  
  
     }
  
  addTouchEventListeners();
  draw();
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  var isMouseDown = false;
  var lastX = 0;
  var lastY = 0;
  var midX = 249;
  var midY = 249;
  var startAngle = 0;
  var isMuted = false;
  
  var choiceTextSize = [];
  var spinTimeout = null;
  var spinArcStart = 10;
  var spinTime = 0;
  var spinTimeTotal = 0;
  var spinAngleEnd = 0;
  
  var ctx;
  var ctxTop;
  
  // Check available screen size so wheel doesn't go outside
  var maxHeight = window.screen.availHeight;
  var maxWidth = window.screen.availWidth;
  var wheelSize = 300;
    var canvasWidth = 300;
  var wheelImage = new Image();
  
  
  function wheelMouseMove(e) {
  if (isMouseDown == true) {
   var x = e.clientX+document.documentElement.scrollLeft+document.body.scrollLeft;
   var y = e.clientY+document.documentElement.scrollTop+document.body.scrollTop;
   var spinAngle = 0;
   if (x > midX) {
    if (y > midY) {
      spinAngle = ((lastX - x) - (lastY - y)) *0.01;
    } else {
         spinAngle = (0-(lastX - x) - (lastY - y)) *0.01;
    }
   } else {
     if (y > midY) {
      spinAngle = ((lastX - x) + (lastY - y)) *0.01;
    } else {
         spinAngle = (0-(lastX - x) + (lastY - y)) *0.01;
    }
   }
   startAngle += (spinAngle * 10 * Math.PI / 180);
   lastX=x;
   lastY=y;
   drawRouletteWheelImage(spinAngle*10);
   }
  }
  function wheelMouseMove2(x,y) {
  if (isMouseDown == true) {
   var spinAngle = 0;
   if (x > midX) {
    if (y > midY) {
      spinAngle = ((lastX - x) - (lastY - y)) *0.01;
    } else {
      spinAngle = (0-(lastX - x) - (lastY - y)) *0.01;
    }
   } else {
     if (y > midY) {
      spinAngle = ((lastX - x) + (lastY - y)) *0.01;
    } else {
      spinAngle = (0-(lastX - x) + (lastY - y)) *0.01;
    }
   }
   
   startAngle += (spinAngle * 10 * Math.PI / 180);
   
   lastX=x;
   lastY=y;
   drawRouletteWheelImage(spinAngle*10);
   }
  }
  function wheelMouseUp(e) {
    isMouseDown = false;
  }
  
  var audio1ended = true;
  var audio2ended = true;
  var audio3ended = true;
  
  function playSound() {
  if (isMuted == false) {
    var audio = document.getElementById("wheelAudio");
    if (audio1ended) {
      audio1ended = false;
      audio.play();
      audio.addEventListener('ended', function () {
        audio1ended = true;
      }, false);
    } else if (audio2ended) {
      audio2ended = false;
      var audio2 = document.getElementById("wheelAudio2");
      audio2.play();
      audio2.addEventListener('ended', function () {
        audio2ended = true;
      }, false);
    } else if (audio3ended) {
      audio3ended = false;
      var audio3 = document.getElementById("wheelAudio3");
      audio3.play();
      audio3.addEventListener('ended', function () {
        audio3ended = true;
      }, false);
    }
  }
  }
  
  function toggleMute(button) {
  var audio = document.getElementById("wheelAudio");
  if (isMuted == true) {
  //audio.volume = 1;
  button.value="Mute"; 
  button.src="images/wd-audio-on.png";
  isMuted = false;
  } else {
  //audio.volume = 0;
  button.value="Unmute";
  button.src="images/wd-audio-off.png";
  isMuted = true;
  }
  }
  
  
  function addTouchEventListeners() {
  var wheeldiv = document.getElementById("wheelcanvastop");
  wheeldiv.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    wheelMouseMove2(touch.pageX,touch.pageY);
  }, false);
  
  wheeldiv.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    wheelMouseDown(touch);
  }, false);
  
  wheeldiv.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    wheelMouseUp(touch);
    spin();
  }, false);
  }
  
  
  
  function clearTopCanvas() {
  var canvasTop = document.getElementById("wheelcanvastop");
  if (canvasTop.getContext) {	
    ctxTop = canvasTop.getContext("2d");
    ctxTop.clearRect(0, 0, canvasWidth, canvasWidth);
  }
  }
  
  function draw() {
    setChoiceFontSizes();
    drawRouletteWheel();
  setWheelImageSource();
  }
  
  function drawArrow() {
  var canvasTop = document.getElementById("wheelcanvastop");
  if (canvasTop.getContext) {
  
    ctxTop = canvasTop.getContext("2d");
    
    //Arrow
    ctxTop.fillStyle = "black";
    ctxTop.beginPath();      
    // Left Side
    ctxTop.moveTo(0, wheelRadius + 5);
    ctxTop.lineTo(0, wheelRadius - 5);
    ctxTop.lineTo(13, wheelRadius );
    ctxTop.lineTo(0, wheelRadius + 5);
    
    ctxTop.fill();
    //ctxTop.translate( canvas.width/2 , canvas.height/2 );
    
  }
  }
  
    function setWheelImageSource() {
  var canvas = document.getElementById("wheelcanvas");
  if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    if (wheelImage.src == "") {
      wheelImage.src = canvas.toDataURL();
    }
  }
  }
  
  function drawRouletteWheelImage(spinAngle) {
    var canvas = document.getElementById("wheelcanvas");
    if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    //ctx.save();
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.drawImage( wheelImage, -canvas.width/2,-canvas.width/2 );
    ctx.rotate(spinAngle*Math.PI/180);
  }
    
  }
  var wedgeAngle = 360 / 12;
  var angleSinceBeep = 0;
  var timeSinceBeep = 0;
  var isFirstSpinCycle = false;
  var isOddNumberOfChoices = false;
  var lastChoiceBeepedFor = -1;
  function rotateWheelImage() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheelImage();
        return;
    }
    var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    var spinAngleRad = spinAngle * Math.PI / 180;
    startAngle += spinAngleRad;
    
    
    // determine whether to play the sound 
    playSoundIfNeededWithWeights(); //playSoundIfNeeded(spinAngleRad);
    
    // spin the wheel image
    drawRouletteWheelImage(spinAngle);
    clearTimeout(spinTimeout);
    spinTimeout = setTimeout('rotateWheelImage()', 30);
  }
  
  function playSoundIfNeeded(spinAngleRad) {
    if (isOddNumberOfChoices && isFirstSpinCycle && (angleSinceBeep > wedgeAngle/2 && timeSinceBeep > 30)) {
        timeSinceBeep = 0;
        angleSinceBeep = startAngle % (wedgeAngle/2);
        isFirstSpinCycle = false;
        playSound();
    } else if (angleSinceBeep > wedgeAngle && timeSinceBeep > 30) {
        timeSinceBeep = 0;
        angleSinceBeep = startAngle % wedgeAngle;
        if (isOddNumberOfChoices) {
            angleSinceBeep -= wedgeAngle/2;
        }
        playSound();
    } else {
        angleSinceBeep += spinAngleRad;
        timeSinceBeep += 30;
    }
  }
  
  function playSoundIfNeededWithWeights() {
    // use "startAngle" to check if the current angle is passed the next angle that
    // should beep. may need to add another variable tracking what the last angle it 
    // beeped for
    if (timeSinceBeep > 30) {
        var currChoiceIndex = getCurrentChoiceWithWeights().index;
        if (currChoiceIndex != lastChoiceBeepedFor) {
            lastChoiceBeepedFor = currChoiceIndex;
            timeSinceBeep = 0;
            playSound();
        } else {
            timeSinceBeep += 30;
        }
        
    } else {
        timeSinceBeep += 30;
    }
    
  }
  
  function easeOut(t, b, c, d) {
    var ts = (t/=d)*t;
    var tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
  }
  
  function getCurrentChoice() {
   var degrees = startAngle * 180 / Math.PI + 180; // left side, not top
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
  var text = restaurants[index];
  var choice = { text: text, index: index };
  return choice;
  }
  function getCurrentChoiceWithWeights() {
        var degrees = startAngle * 180 / Math.PI + 180; // left side, not top
        var arcd = arc * 180 / Math.PI;
        var degreesMod = 360 - degrees % 360;
        var weightedIndex = 0;
        for (var index = 0; index < restaurants.length; index++) {
            var weight = 1;
            if (weights.length > index) {
                weight = weights[index];
            }
            weightedIndex += weight;
            if (degreesMod < weightedIndex * arcd) {
                var text = restaurants[index];
                var choice = { text: text, index: index };
                return choice;
            }
        }
        var index = Math.floor((360 - degrees % 360) / arcd);
        var text = restaurants[index];
        var choice = { text: text, index: index };
        return choice;
  }
  