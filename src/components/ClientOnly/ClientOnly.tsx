import dynamic from "next/dynamic";

type ClientOnlyProps = { children: React.ReactNode };
const ClientOnly = (props: ClientOnlyProps) => {
  const { children } = props;

  return <>{children}</>;
};

export default dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
});
