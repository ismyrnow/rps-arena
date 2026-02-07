import Heading from "./shared/Heading";
import LoadingDots from "./shared/LoadingDots";
import Subheading from "./shared/Subheading";

export default function Connecting() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Heading>Connecting...</Heading>
      <Subheading>Establishing a connection to the server</Subheading>
      <LoadingDots />
    </div>
  );
}
