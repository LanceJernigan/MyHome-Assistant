import {
  ChangeEvent,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const ExpandingTextArea = (props: React.HTMLProps<HTMLTextAreaElement>) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState("auto");

  const handleInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaHeight("auto");
    setText(e.target.value);

    if (props.onInput) {
      props.onInput(e);
    }
  }, []);

  useEffect(() => {
    setTextAreaHeight(
      `${
        (textAreaRef.current?.scrollHeight || 0) < 200
          ? textAreaRef.current?.scrollHeight
          : 200
      }px`
    );
  }, [text]);

  return (
    <textarea
      {...props}
      style={{
        ...(props.style || {}),
        height: textAreaHeight,
      }}
      ref={textAreaRef}
      onInput={handleInput}
    />
  );
};

export default ExpandingTextArea;
