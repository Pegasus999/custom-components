import React from "react";
import { Button } from "./ui/button";
import Spinner from "./spinner";

type SubmitButtonProps = {
  children: React.ReactNode;
  isLoading: boolean;
} & React.HTMLProps<HTMLButtonElement>;

function SubmitButton(props: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={props.isLoading}>
      {props.isLoading ? (
        <>
          <Spinner /> <span>En cours...</span>
        </>
      ) : (
        props.children
      )}
    </Button>
  );
}

export default SubmitButton;
