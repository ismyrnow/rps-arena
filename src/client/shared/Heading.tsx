interface Props {
  children: React.ReactNode;
}

export default function Heading(props: Props) {
  return (
    <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center">
      {props.children}
    </h2>
  );
}
