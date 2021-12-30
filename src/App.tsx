import { Slider } from "./components/Slider";
import { Button } from "./components/Button";
import { BaseSyntheticEvent, createRef, LegacyRef, useEffect } from "react";

function App() {
    const canvasRef: LegacyRef<HTMLCanvasElement> = createRef();
    const srcImage = new Image();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas == undefined) {
            alert("Canvas is unsupported");
            return;
        }
        const ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 450;
        srcImage.addEventListener(
            "load",
            () => {
                ctx?.drawImage(
                    srcImage,
                    0,
                    0,
                    srcImage.width,
                    srcImage.height,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
            },
            false
        );
    }, []);

    return (
        <div className="bg-dark-900 max-w-screen h-screen flex">
            <aside className="w-[260px] bg-dark-800 text-[#FFFFFF] px-5">
                <input
                    type="file"
                    accept="image/*"
                    onChangeCapture={(event) => handleInput(event, srcImage)}
                />
                <div className="flex justify-between">
                    <Button text={"L"} />
                    <Button text={"R"} />
                    <Button text={"V"} />
                    <Button text={"H"} />
                </div>
                <Slider text={"Red"} min={-255} max={255} initialValue={0} />
                <Slider text={"Green"} min={-255} max={255} initialValue={0} />
                <Slider text={"Blue"} min={-255} max={255} initialValue={0} />
            </aside>
            <canvas className="bg-[black] m-auto" ref={canvasRef}></canvas>
        </div>
    );
}

function handleInput(
    event: BaseSyntheticEvent,
    imageSrc: HTMLImageElement
): void {
    console.log(event.target.files[0]);
    imageSrc.src = URL.createObjectURL(event.target.files[0]);
}

export default App;
