import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Spinner() {
  return (
    <AiOutlineLoading3Quarters
      className="animate-spin"
      style={{ width: "24px", height: "24px" }}
    />
  );
}
