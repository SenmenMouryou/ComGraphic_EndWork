
"use strict";


//绘制模型
var canvas;
var gl;

var program;

var NumVertices  = 0;

var pointsArray = [];
var colorsArray = [];

var framebuffer;

var rotationFlag = false;

var color = new Uint8Array(4);

var vertices = [
    vec4( -0.5, -0.5,  -0.25, 1.0 ),
    vec4( -0.5,  -0.25,  -0.25, 1.0 ),
    vec4( -0.25,  -0.25,  -0.25, 1.0 ),
    vec4( -0.25, -0.5,  -0.25, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  -0.25, -0.5, 1.0 ),
    vec4( -0.25,  -0.25, -0.5, 1.0 ),
    vec4( -0.25, -0.5, -0.5, 1.0 ),
];

var vertices2 = [
    vec4( 0.25, 0.25,  0.5, 1.0 ),
    vec4( 0.25,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, 0.25,  0.5, 1.0 ),
    vec4( 0.25, 0.25, 0.25, 1.0 ),
    vec4( 0.25,  0.5, 0.25, 1.0 ),
    vec4( 0.5,  0.5, 0.25, 1.0 ),
    vec4( 0.5, 0.25, 0.25, 1.0 ),
];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
        vec4( 0.0, 1.0, 1.0, 1.0 ),   // cyan
];

//控制组件
//投影方式控制按钮
var projectionButton;

//世界向上方向
const up = vec3(0.0, 1.0, 0.0);

//旋转参数
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var thetaLoc;

//观察参数
var modelViewMatrix;        //观察矩阵
var projectionMatrix;       //投影矩阵
var modelViewMatrixLoc;
var projectionMatrixLoc;

//投影方式
var projectionFlag = true;

//摄影机位置
var eyePos = vec3(0.0, 0.0, 1.0);
var eye_X = 0.0;
var eye_Y = 0.0;
var eye_Z = 1.0;
//观察距离
var lookAtDistance = 1.0;
//观察角
var lookAtTheta = 0.0;
var lookAtPhi = 0.0;
//观察向量
var lookAtVec = vec3(0.0, 0.0, -lookAtDistance);

//观察点位置
var atPos = vec3(0.0, 0.0, 0.0);

//投影参数
var fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0; // Viewport aspect ratio
var near = 0.02;
var far = 5.0;

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[b]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[c]);
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[c]);
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[d]);
    NumVertices += 6
}

function quad2(a, b, c, d) {
    pointsArray.push(vertices2[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices2[b]);
    colorsArray.push(vertexColors[b]);
    pointsArray.push(vertices2[c]);
    colorsArray.push(vertexColors[c]);
    pointsArray.push(vertices2[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices2[c]);
    colorsArray.push(vertexColors[c]);
    pointsArray.push(vertices2[d]);
    colorsArray.push(vertexColors[d]);
    NumVertices += 6
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function colorCube2()
{
    quad2( 1, 0, 3, 2 );
    quad2( 2, 3, 7, 6 );
    quad2( 3, 0, 4, 7 );
    quad2( 6, 5, 1, 2 );
    quad2( 4, 5, 6, 7 );
    quad2( 5, 4, 0, 1 );
}

//球体迭代初始四面体顶点
var scale = vec4(0.25, 0.25, 0.25, 1);
var va = mult(scale, vec4(0.0, 0.0, -1.0,1));
var vb = mult(scale, vec4(0.0, 0.942809, 0.333333, 1));
var vc = mult(scale, vec4(-0.816497, -0.471405, 0.333333, 1));
var vd = mult(scale, vec4(0.816497, -0.471405, 0.333333,1));

// 球体迭代次数
var numTimesToSubdivide = 4;

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // normals are vectors
    colorsArray.push(vertexColors[3]);
    colorsArray.push(vertexColors[3]);
    colorsArray.push(vertexColors[3]);
    NumVertices += 3;//统计生成的顶点数
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        ab = mult(scale, ab);
        ac = mult(scale, ac);
        bc = mult(scale, bc);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}



window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    var ctx = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //窗口大小
    gl.viewport( 0, 0, canvas.width, canvas.height );

    //消除隐藏面
    gl.enable(gl.CULL_FACE);

    // 开启深度测试
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor( 0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0,
       gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Allocate a frame buffer object

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);


    // Attach color buffer

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //初始化着色器
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //模型初始化
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    colorCube();
    colorCube2();

    //颜色数据
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //顶点数据
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //uniform变量
    thetaLoc = gl.getUniformLocation(program, "theta");
    modelViewMatrixLoc	= gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    //html控件
    // document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    // document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    // document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    // document.getElementById("ButtonT").onclick = function(){rotationFlag = !rotationFlag};

    //按键监听
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    document.addEventListener('keypress', keyPress);
    //鼠标监听
    document.addEventListener('mousemove',mouseMotion);

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT );

    //旋转
    if(rotationFlag) theta[axis] += 2.0;

    //观察方向
    setAtPos();
    //摄影机位置
    setEyePos();

    //观察矩阵
    modelViewMatrix = lookAt(eyePos, atPos , up);

    //投影矩阵
    if(projectionFlag){
        //透视投影
        projectionMatrix = perspective(fovy, aspect, near, far);
    }
    else{
        //平行投影
        projectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, near, far);
    }

    gl.uniform3fv(thetaLoc, theta);
    gl.uniform1i(gl.getUniformLocation(program, "i"),0);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame(render);
}

var key_W = false;
var key_A = false;
var key_S = false;
var key_D = false;
var key_Q = false;
var key_E = false;

var setEyePos = function () {

    const stepSize = 0.01;

    if(key_W){
        eyePos = vec3(
            eyePos[0] + lookAtVec[0] * stepSize,
            eyePos[1] + lookAtVec[1] * stepSize,
            eyePos[2] + lookAtVec[2] * stepSize);
        // lookAtZ -= stepSize;
    }
    if(key_A){
        eyePos = vec3(
            eyePos[0] + lookAtVec[2] * stepSize,
            eyePos[1],
            eyePos[2] - lookAtVec[0] * stepSize
        );
        // lookAtX -= stepSize;
    }
    if(key_S){
        eyePos = vec3(
            eyePos[0] - lookAtVec[0] * stepSize,
            eyePos[1] - lookAtVec[1] * stepSize,
            eyePos[2] - lookAtVec[2] * stepSize);
        // lookAtZ += stepSize;
    }
    if(key_D){
        eyePos = vec3(
            eyePos[0] - lookAtVec[2] * stepSize,
            eyePos[1],
            eyePos[2] + lookAtVec[0] * stepSize
        );
        // lookAtX += stepSize;
    }
    // if(key_E){
    //     eye_Y -= stepSize;
    //     // lookAtY -= stepSize;
    // }
    // if(key_Q){
    //     eye_Y += stepSize;
    //     // lookAtY += stepSize;
    // }
}

/**
 * 键盘按键按下事件
 * @param e
 */
var keyDown = function(e) {

    var keyCode = e.keyCode;

    if(keyCode == 87){
        key_W = true;
    }
    if(keyCode == 65){
        key_A = true;
    }
    if(keyCode == 83){
        key_S = true;
    }
    if(keyCode == 68){
        key_D = true;
    }
    if(keyCode == 69){
        key_E = true;
    }
    if(keyCode == 81){
        key_Q = true;
    }
}

/**
 * 键盘按键抬起事件
 * @param e
 */
var keyUp = function (e) {

    var keyCode = e.keyCode;

    if(keyCode == 87){
        key_W = false;
    }
    if(keyCode == 65){
        key_A = false;
    }
    if(keyCode == 83){
        key_S = false;
    }
    if(keyCode == 68){
        key_D = false;
    }
    if(keyCode == 69){
        key_E = false;
    }
    if(keyCode == 81){
        key_Q = false;
    }

}
var keyPress = function (e) {

    var keyCode = e.which;

    if(keyCode == 114){
        //Key_R
        if(rotationFlag){
            rotationFlag = false;
        }
        else {
            rotationFlag = true;
        }
    }
    if(keyCode == 112){
        //Key_P
        if(projectionFlag){
            projectionFlag = false;
        }
        else {
            projectionFlag = true;
        }
    }
    if(keyCode == 49){
        //Key_1
        if(rotationFlag){
            axis = xAxis;
        }
    }
    if(keyCode == 50){
        //Key_2
        if(rotationFlag){
            axis = yAxis;
        }
    }
    if(keyCode == 51){
        //Key_3
        if(rotationFlag){
            axis = zAxis;
        }
    }

}

/**
 * 计算并设置观察点坐标
 */
var setAtPos = function () {
    var PI = Math.PI;

    var lookAtX = lookAtDistance * Math.cos(0.5*PI - lookAtTheta);
    var lookAtY = lookAtDistance * Math.sin(lookAtPhi);
    var lookAtZ = lookAtDistance * (-1) * Math.sin(0.5*PI - lookAtTheta);


    lookAtVec = vec3 (lookAtX, lookAtY, lookAtZ );

    atPos = vec3(lookAtVec[0] + eyePos[0],
                 lookAtVec[1] + eyePos[1],
                 lookAtVec[2] + eyePos[2]);
}

//前一帧的鼠标坐标
var prevMouse_X = 0;
var prevMouse_Y = 0;

/**
 * 鼠标移动事件
 * @param e
 */
var mouseMotion = function (e) {
    console.log(prevMouse_X+" "+prevMouse_Y);

    var newMouse_X = e.clientX;
    var newMouse_Y = e.clientY;

    var delta_X = newMouse_X - prevMouse_X;
    var delta_Y = newMouse_Y - prevMouse_Y;

    const stepSize = 0.5;

    lookAtTheta += (delta_X * stepSize)/180*Math.PI;

    console.log(lookAtPhi)
    if(lookAtPhi <= Math.PI/2 && lookAtPhi >= -Math.PI/2) {
        lookAtPhi -= (delta_Y * stepSize) / 180 * Math.PI;
    }
    else if(lookAtPhi > Math.PI/2){
        lookAtPhi = Math.PI/2;
    }
    else if(lookAtPhi < -Math.PI/2){
        lookAtPhi = -Math.PI/2;
    }

    prevMouse_X = newMouse_X;
    prevMouse_Y = newMouse_Y;

}

/**
 * 切换投影方式：透视投影/平行投影
 */
var changeProjectionType = function () {
    if(projectionFlag){
        projectionFlag = false;
    }
    else {
        projectionFlag = true;
    }
}

