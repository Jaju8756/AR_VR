import {useEffect, useRef, useState} from 'react';
import {SWATCHES} from '@/constants';
import { ColorSwatch, Group, Slider } from '@mantine/core';
import {Button} from '@/components/ui/button';
import Draggable from 'react-draggable';
import {MathJaxContext} from "better-react-mathjax";
import axios from 'axios';

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

export default function Home(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [isErasing, setIsErasing] = useState<boolean>(false); // Track eraser mode
    const [eraserWidth, setEraserWidth] = useState<number>(20); // State for eraser width
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [latexPosition, setLatexPosition] = useState({x: 10, y: 200});
    const [dictOfVars, setDictOfVars] = useState({});

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        if (latexExpression.length > 0 && window.Mathjax){
            setTimeout(() => {
                window.Mathjax.Hub.Queue(["Typeset", window.Mathjax.Hub]);
            }, 0);
        }
    }, [latexExpression])

    useEffect(() => {
        if (result){
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas){
            const ctx = canvas.getContext('2d');
            if (ctx){
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3; 
            }
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/config/TeX-MML-AM_CHTML.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
            })
        };

        return () => {
            document.head.removeChild(script);
        }

    }, []);

    const renderLatexToCanvas = (expression: string, answer:string) => {
        const latex = `${expression} = ${answer}`;
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };  
    
    const sendData = async () => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            console.log('Response', resp);
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    // dict_of_vars[resp.result] = resp.answer;
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    })
                }
            })
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                });
            }, 200);
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx){
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const toggleEraser = () => {
        setIsErasing((prev) => !prev);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) =>{
        if (!isDrawing){
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // if (ctx){
            //     ctx.strokeStyle = color;
            //     ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            //     ctx.stroke();
            // }
            if (ctx) {
                if (isErasing) {
                    // Clear small area where the mouse is (simulate eraser)
                    ctx.clearRect(
                        e.clientX - eraserWidth / 2,
                        e.clientY - eraserWidth / 2,
                        eraserWidth,
                        eraserWidth
                    );
                } else {
                    ctx.strokeStyle = color;
                    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                    ctx.stroke();
                }
            }
        }
    };
    
    return (
        <>
            <div className='flex space-x-2 items-center'>
                <Button
                    onClick={() => setReset(true)}
                    className='z-20 bg-black text-white'
                    variant='default'
                    color='black'
                >
                    Reset
                </Button>
    
                <Group className='z-20 flex'>
                    {SWATCHES.map((swatchColor: string) => (
                        <ColorSwatch
                            key={swatchColor}
                            color={swatchColor}
                            onClick={() => setColor(swatchColor)}
                        />
                    ))}
                </Group>
    
                <Button
                    onClick={sendData}
                    className='z-20 bg-black text-white'
                    variant='default'
                    color='black'
                >
                    Calculate
                </Button>
    
                <Button
                    onClick={toggleEraser}
                    className='z-20 bg-black text-white'
                    variant='default'
                    color='black'
                >
                    {isErasing ? 'Draw' : 'Erase'}
                </Button>
    
                {/* Slider next to the Eraser button */}
                {isErasing && (
                    <Slider
                        value={eraserWidth}
                        onChange={setEraserWidth}
                        min={5}
                        max={100}
                        step={1}
                        label={`Eraser Width: ${eraserWidth}px`}
                        className="w-48" // Adjust width of the slider
                    />
                )}
            </div>
    
            <canvas
                ref={canvasRef}
                id='canvas'
                className='absolute top-0 left-0 w-full h-full'
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
            />
    
            {latexExpression && latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div 
                        className="absolute p-2 text-white rounded shadow-md"
                    >
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </>
    );
    
    
}