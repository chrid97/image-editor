import { Slider } from "./components/Slider";
import { Button } from "./components/Button";

function App() {
    return (
        <div className="bg-dark-900 max-w-screen min-h-screen">
            <aside className="w-[260px] h-screen bg-dark-800 text-[#FFFFFF] px-5">
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
        </div>
    );
}

export default App;
