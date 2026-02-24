import { useState } from "react";
import Heading from "./shared/Heading";
import Subheading from "./shared/Subheading";
import Button from "./shared/Button";

interface Props {
  onEnter: (name: string) => void;
  existingName?: string;
}

export default function Entry({ onEnter, existingName }: Props) {
  const [name, setName] = useState(existingName ?? "");
  const [changingName, setChangingName] = useState(false);

  const showNameForm = !existingName || changingName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onEnter(trimmed);
    }
  };

  const heading = existingName
    ? `Welcome back, ${existingName}!`
    : "Welcome to RPS Arena";

  return (
    <div className="flex flex-col w-full items-center justify-center gap-8">
      <section className="text-center">
        <Heading>{heading}</Heading>
        {showNameForm && <Subheading>Enter your name to start playing</Subheading>}
      </section>

      {showNameForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
            className="w-full px-4 py-2 text-lg border-2 border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-neutral-500"
          />
          <Button type="submit" size="lg" disabled={!name.trim()}>
            Play!
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={() => onEnter(existingName!)}>
            Play
          </Button>
          <div>
            or{" "}
            <a
              className="underline cursor-pointer"
              href="#"
              onClick={(e) => { e.preventDefault(); setChangingName(true); }}
            >
              change name
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
