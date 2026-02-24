import Heading from "./shared/Heading";
import LoadingDots from "./shared/LoadingDots";
import Subheading from "./shared/Subheading";

export default function Lobby() {
  return (
    <div className="flex flex-col w-full items-center justify-center gap-8">
      <section>
        <Heading>Waiting for opponent...</Heading>
        <Subheading>Looking for someone to battle with</Subheading>
      </section>
      <section>
        <LoadingDots />
      </section>
    </div>
  );
}
