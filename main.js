const canvas = document.getElementById('drawpad');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const minicanvas = document.getElementById('downsize');
const minictx = minicanvas.getContext('2d', { willReadFrequently: true });


let isDrawing = false;
const pencil = document.getElementById('pencil');
const eraser = document.getElementById('eraser');
pencil.selected = true;
eraser.selected = false;
ctx.strokeStyle = ("white");

//Pencil Button
pencil.addEventListener("click", () => {
    pencil.selected = true;
    eraser.selected = false;
    pencil.classList.add('selected');
    eraser.classList.remove('selected');
    ctx.beginPath();
    ctx.strokeStyle = ("white");
});


//Eraser Button
eraser.addEventListener("click", () => {
    pencil.selected = false;
    eraser.selected = true;
    pencil.classList.remove('selected');
    eraser.classList.add('selected');
    ctx.beginPath();
    ctx.strokeStyle = ("black");
});

// Draw 28 x 28 grid for representing the downsampled canvas drawing
const perceptronDivCanvas = document.createElement('canvas');
perceptronDivCanvas.setAttribute('id', 'perceptronDivs');
perceptronDivCanvas.width = (window.innerWidth * 0.2);
perceptronDivCanvas.height = (window.innerWidth * 0.2);
const perceptronDivContext = perceptronDivCanvas.getContext('2d');

document.getElementById('networkcontent').appendChild(perceptronDivCanvas);

// function drawPerceptron() {
const nodeSize = (window.innerWidth * 0.2)/28;

perceptronDivContext.linewidth = 1;
perceptronDivContext.strokeStyle = 'blue';//'#ffffff55';

for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
        const xPos = j * nodeSize;
        const yPos = i * nodeSize;
        perceptronDivContext.fillStyle = "black";

        perceptronDivContext.fillRect(xPos, yPos, nodeSize, nodeSize);
        
        perceptronDivContext.fillStyle = "#8e8e8e";
        perceptronDivContext.fillRect(xPos-0.5, yPos, 1, nodeSize*28);
        perceptronDivContext.fillRect(xPos, yPos-0.5, nodeSize*28, 1);
    }
}


//Create and initialize nodes for representing the Neural Network Layers
class NeuralNetworkCanvs {
    constructor(L1labels, layer1, L2labels, layer2, output, outputlabels) {
        this.L1labels = L1labels;
        this.layer1 = layer1;
        this.L2labels = L2labels;
        this.layer2 = layer2;
        this.output = output;
        this.outputlabels = outputlabels;
    }

    drawLayerCanv(node, numNodes, color){
        // const nodeSize = ((window.innerWidth * 0.2)/28);
        const nodectx = node.getContext('2d', { willReadFrequently: true });
        
        for (let i = 0; i < numNodes; i++) {
            const xPos = i * nodeSize;
            const yPos = 0;
            if (node.classList.contains("layer_label")) {
                nodectx.fillStyle = color;
                nodectx.font = "bold " + nodeSize + "px Arial";
                nodectx.textAlign = "center";
                if (node.id == 'outputlabels') {
                    nodectx.fillText(i, xPos + (nodeSize/2), yPos + nodeSize);
                } else {
                    nodectx.fillText('Dense Layer (' + numNodes + ' nodes)', xPos + (node.width/2), yPos + nodeSize);
                    break
                }
                    
            } else {
                nodectx.fillStyle = color;
                nodectx.fillRect(xPos, yPos, nodeSize, nodeSize); 
            }

        }
    }

    drawLines(node, numNodes) {
        const nodectx = node.getContext('2d', { willReadFrequently: true });

        for (let i = 1; i < numNodes; i++) {
            const xPos = i * nodeSize;
            const yPos = 0;
            if (!node.classList.contains("layer_label")) {
                nodectx.fillStyle = "#8e8e8e";
                nodectx.fillRect(xPos-0.5, yPos, 1, nodeSize);
            }

        }
    }

    createCanvNodes(layerName, numNodes) {
        const node = document.createElement('canvas');
        node.setAttribute('id', layerName);
        node.classList.add(`node${numNodes}`, 'node')
        node.width = ((window.innerWidth * 0.2)/28)*numNodes;

        if (layerName == 'outputlabels' || layerName == 'L1labels' || layerName == 'L2labels') {
            node.setAttribute("class", "layer_label")
            node.height = ((window.innerWidth * 0.2)/20);
            node.style.marginBottom = "5px";
        } else {
            node.height = ((window.innerWidth * 0.2)/28);
            node.style.marginBottom = "7vh";
        }

        document.getElementById('layers').appendChild(node);
        
        this.drawLayerCanv(node, numNodes, "black");
        this.drawLines(node, numNodes);
    }
    
    initialize() {
        this.createCanvNodes(this.outputlabels, 10);
        this.createCanvNodes(this.output, 10);
        this.createCanvNodes(this.L2labels, 64)
        this.createCanvNodes(this.layer2, 64);
        this.createCanvNodes(this.L1labels, 128)
        this.createCanvNodes(this.layer1, 128);
    }
}

const neuralNetworkInstance = new NeuralNetworkCanvs("L1labels", "layer1", "L2labels", "layer2", "output", "outputlabels");

neuralNetworkInstance.initialize();


// Colorscale for divs
function bgColor(weight) {
    let scale = chroma.scale(['#ff005e', '#93003a','#000000', '00429d', '#96ffea']).domain([-1,1]);
    return scale(weight).hex();
}

//Draw the gradient scale index
const scalecanvas = document.getElementById('scale')
const scalectx = scalecanvas.getContext('2d');

for (let i = 0; i < scalecanvas.width; i++) { 
    const val = (i/scalecanvas.width)*2 - 1;
    const color = bgColor(val);
    scalectx.fillStyle = color;
    scalectx.fillRect(i, 0, 1, scalecanvas.height);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;

    // Transform mouse position to match canvas' coordinate system
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = (e.clientY - rect.top);

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}


// Trash Button
function clearCanvas() {
    const canvasElements = document.querySelectorAll('canvas:not(.layer_label, #scale)');
    canvasElements.forEach(canvas => {
        const clearCtx = canvas.getContext('2d');
        clearCtx.fillStyle = "black";
        clearCtx.fillRect(0,0, canvas.width, canvas.height);

        // Redraw lines on canvas on clear
        clearCtx.fillStyle = "#8e8e8e";
        if (canvas.id == 'perceptronDivs') {
            for (let i = 0; i < 28; i++) {
                for (let j = 0; j < 28; j++) {
                    const xPos = j * nodeSize;
                    const yPos = i * nodeSize;
        
                    //draws lines between nodes
                    clearCtx.fillRect(xPos-0.5, yPos, 1, nodeSize);
                    clearCtx.fillRect(xPos, yPos-0.5, nodeSize, 1);
                }
            }
        } else if (!canvas.classList.contains('canv')) {
            for (let i = 1; i < (canvas.width / nodeSize); i++) {
                const xPos = i * nodeSize;
                const yPos = 0;
                clearCtx.fillRect(xPos-0.5, yPos, 1, nodeSize);
            }
        } 
    })
}


const clearButton = document.getElementById("clear")
clearButton.addEventListener("click", () => {
    clearCanvas();
});


function downsample() {
    //takes the drawpad canvas and resizes it to the minicanvas
    minictx.drawImage(canvas, 0, 0, minicanvas.width, minicanvas.height);
}

function processMinictx() {
    const imageData = minictx.getImageData(0, 0, minicanvas.width, minicanvas.height);
    const perceptronData = imageData.data;
    
    //calculate grayscale value for each pixel
    const grayscaleImg = [];
    for (let i = 0; i < perceptronData.length; i += 4) {
        r = perceptronData[i];
        g  = perceptronData[i + 1];
        b  = perceptronData[i + 2];
        
        const bwVal = (r + g + b) / 3;

        grayscaleImg.push(bwVal);
    }

    //push grayscale values to the downsampled drawing's canvas
    minictx.putImageData(imageData, 0, 0, 0, 0, minicanvas.width, minicanvas.height)

    return grayscaleImg;
}

// activation functions
function relu(num){
    if (num<0) {
        num = 0;
    }
    return num;
}
function softmax(x) {
    //Reduce dimensionality for easier computation 
    // [[1,2,3,4]] -> [1,2,3,4]
    x=x[0];

    let sum = 0;

    for (let i = 0; i < x.length; i++) {
        x[i] = Math.exp(x[i]);
        sum += x[i];
    }

    for (let i = 0; i < x.length; i++) {
        x[i] /= sum;
    }

    return x;
}

//multiplies two matrices, adds the bias, and applies the activation function
function MatMul(input, weight, bias, activation = "tanh") {
    const numRowsInput = input.length;
    const numRowsWeight = weight.length;
    const numColsWeight = weight[0].length;
 
    let result = [];
    for (let i = 0; i < numRowsInput; i++) {
        result.push([]);
        for (let j = 0; j < numColsWeight; j++) {
            result[i].push(0);
            for (let k = 0; k < numRowsWeight; k++) {
                //calculate dot product
                result[i][j] += (input[i][k] * weight[k][j])
            }
            
            //add bias
            result[i][j] += bias[j];

            //apply activation function
            if (activation == "relu") {
                result[i][j] = relu(result[i][j]);
            }
            if (activation == "tanh") {
                result[i][j] = Math.tanh(result[i][j]);
            }
        }
    }

    if (activation == "softmax") {
        //[] used to regain dimensionality for standardization of outputs
        result = [softmax(result)];
    }

    return result;
}

function transpose(arr){
    const result = [];
    for (let col = 0; col < arr[0].length; col++) {
        result.push([]);
        for (let row = 0; row < arr.length; row++) {
            result[col].push(arr[row][col]);
        }
    }
    return result;
}

function setPerceptronColor(data) {
    let index = 0
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            const xPos = j * nodeSize;
            const yPos = i * nodeSize;
            perceptronDivContext.fillStyle = bgColor(data[index]/255.0);
            perceptronDivContext.fillRect(xPos, yPos, nodeSize, nodeSize);

            //draws lines between nodes
            perceptronDivContext.fillStyle = "#8e8e8e";
            perceptronDivContext.fillRect(xPos-0.5, yPos, 1, nodeSize);
            perceptronDivContext.fillRect(xPos, yPos-0.5, nodeSize, 1);

            index += 1;
        }
    }
}

function setLayerColor(data, layerName, numNodes) {
    const node = document.getElementById(layerName);
    const nodectx = node.getContext('2d');

    let index = 0
    for (let i = 0; i < numNodes; i++) {
        const xPos = i * nodeSize;
        const yPos = 0;
        
        nodectx.fillStyle = bgColor(data[0][index]);
        nodectx.fillRect(xPos, yPos, nodeSize, nodeSize);

        //draws lines between nodes
        nodectx.fillStyle = "#8e8e8e";
        nodectx.fillRect(xPos-0.5, yPos, 1, nodeSize);

        index += 1;
    }
}

async function fetchData() {
    return fetch('./src/weights_and_biases.json')
    .then(response => response.json())
    .then(data => {
        (data);
        const weightL1 = data.Weight1;
        const biasL1 = data.Bias1;
        const weightL2 = data.Weight2;
        const biasL2 = data.Bias2;
        const weightLout =  data.Weight3;
        const biasLout = data.Bias3;

        return { weightL1, biasL1, weightL2, biasL2, weightLout, biasLout};
    });
}

function processImgforNN(){

    stopDrawing();

    downsample();
    grayscaleImg = processMinictx();
    setPerceptronColor(grayscaleImg);
    var flattenedInput = grayscaleImg.flat()

    // Forces flattened output to be a 2D array. ex. [1,2,3] - > [[1],[2],[3]]
    const processedInput = []
    for(let i=0; i<flattenedInput.length; i++){
        processedInput.push([flattenedInput[i]]);
    }

    fetchData().then(({ weightL1, biasL1, weightL2, biasL2, weightLout, biasLout }) => {
        const W_1out = MatMul(transpose(processedInput), weightL1, biasL1);
        setLayerColor(W_1out, layerName = "layer1", numNodes = 128);
        const W_2out = MatMul(W_1out, weightL2, biasL2);
        setLayerColor(W_2out, layerName = "layer2", numNodes = 64);
        const W_final = MatMul(W_2out, weightLout, biasLout, activation = "softmax");
        setLayerColor(W_final, layerName = "output", numNodes = 10);

        const prediction = W_final[0].indexOf(Math.max(...W_final[0]));

        
        const predctx = document.getElementById('Best Guess').getContext('2d');
        //Makes sure that the best guess canvas doesn't write the new guess on top of the old one
        predctx.fillStyle = "black";
        predctx.fillRect(0,0, predctx.canvas.width, predctx.canvas.height);

        // Write best guess to the DOM
        predctx.fillStyle = "white";
        predctx.font = "bold " + predctx.canvas.width + "px Arial";
        predctx.textAlign = "center";
        predctx.textBaseline = "middle";
        predctx.fillText(prediction, predctx.canvas.width/2, predctx.canvas.height/2+2);
      });
}

//Canvas events
canvas.addEventListener('mousedown', startDrawing);

canvas.addEventListener('mouseup', processImgforNN);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('mousemove', draw);