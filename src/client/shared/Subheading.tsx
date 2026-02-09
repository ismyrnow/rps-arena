interface Props {
  children: React.ReactNode;
}

export default function Subheading(props: Props) {
  return <p className="text-lg text-center">{props.children}</p>;
}
