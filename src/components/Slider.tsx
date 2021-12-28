import { ChangeEvent, createRef, useState } from "react";

interface SliderComponent {
  text: string;
  min: number;
  max: number;
  initialValue: number;
}

export const Slider: React.FC<SliderComponent> = ({
  text,
  min,
  max,
  initialValue,
}) => {
  const [value, setValue] = useState(initialValue);
  const ref = createRef<HTMLLabelElement>();
  return (
    <div>
      <div className="flex justify-between">
        <label
          ref={ref}
          onMouseOver={() => (ref.current!.textContent = "Reset")}
          onMouseOut={() => (ref.current!.textContent = text)}
          onClick={() => setValue(0)}
          className="w-full"
        >
          {text}
        </label>
        <input
          className="bg-[transparent] h-[24px] w-[55px] text-right pr-[2px]"
          type="text"
          min={min}
          max={max}
          value={value}
          onChange={(event) => handleChange(event, setValue)}
        ></input>
      </div>
      <input
        className="w-full"
        type="range"
        min={min}
        max={max}
        value={value}
        step="1"
        onChange={(event) => handleChange(event, setValue)}
      ></input>
    </div>
  );
};

function handleChange(event: ChangeEvent<HTMLInputElement>, setvalue: any) {
  setvalue(event.target.value);
}
