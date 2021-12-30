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
        canvas.width = document.body.clientWidth - 260;
        canvas.height = document.body.clientHeight;
        srcImage.addEventListener(
            "load",
            () => {
                ctx?.drawImage(
                    srcImage,
                    canvas.width / 2 - srcImage.width / 2,
                    canvas.height / 2 - srcImage.height / 2
                );
                ctx?.getImageData(
                    canvas.width / 2 - srcImage.width / 2,
                    canvas.height / 2 - srcImage.height / 2,
                    srcImage.width,
                    srcImage.height
                );
            },
            false
        );
    }, []);

    return (
        <div className="bg-dark-900 max-w-screen min-h-screen flex">
            <aside className="w-[260px] h-screen bg-dark-800 text-[#FFFFFF] px-5">
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
            <canvas className="bg-[black]" ref={canvasRef}></canvas>
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
