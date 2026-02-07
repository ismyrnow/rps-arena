interface Props {
  children: React.ReactNode;
}

export default function Subheading(props: Props) {
  return (
    <p className="text-base-content/70 text-lg sm:text-xl mb-8 text-center">
      {props.children}
    </p>
  );
}
