import { Slider } from "./components/Slider";

function App() {
  return (
    <div className="bg-dark-900 max-w-screen min-h-screen">
      <aside className="w-[260px] h-screen bg-dark-800 text-[#FFFFFF] px-5">
        <Slider text={"Red"} min={-255} max={255} initialValue={0}></Slider>
        <Slider text={"Green"} min={-255} max={255} initialValue={0}></Slider>
        <Slider text={"Blue"} min={-255} max={255} initialValue={0}></Slider>
      </aside>
    </div>
  );
}

export default App;
