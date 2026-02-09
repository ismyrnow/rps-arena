import Heading from "./shared/Heading";
import LoadingDots from "./shared/LoadingDots";
import Subheading from "./shared/Subheading";

interface Props {
  playerId: string;
}

export default function Lobby(props: Props) {
  return (
    <div className="flex flex-col w-full items-center justify-center gap-8">
      <section>
        <Heading>Waiting for opponent...</Heading>
        <Subheading>Looking for someone to battle with</Subheading>
      </section>
      <section>
        <LoadingDots />
      </section>
      <section>
        <p className="text-sm text-neutral-500">Player ID: {props.playerId}</p>
      </section>
    </div>
  );
}
