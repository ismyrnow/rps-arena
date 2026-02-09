import Heading from "./shared/Heading";
import LoadingDots from "./shared/LoadingDots";
import Subheading from "./shared/Subheading";

export default function Connecting() {
  return (
    <div className="flex flex-col w-full items-center justify-center min-h-[50vh] gap-8">
      <div>
        <Heading>Connecting...</Heading>
        <Subheading>Establishing a connection to the server</Subheading>
      </div>
      <LoadingDots />
    </div>
  );
}
