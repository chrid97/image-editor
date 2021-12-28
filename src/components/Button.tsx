export const Button: React.FC<{ text: string }> = ({
    text,
}: {
    text: string;
}) => {
    return (
        <button className="bg-dark-700 w-[50px] h-[34px] rounded-[4px]">
            {text}
        </button>
    );
};
