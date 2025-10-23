interface Props {
    children:React.ReactNode
};
const Layout = ({children}:Props) =>{
    return (
        <div className="bg-muted flex  min-h-svh flex-col items-center justify-center p-6 md:to-pink-100">
            <div className="w-full max-w-sm md:max-w-3xl">
            {children}
            </div>
        </div>
    );
}

export default Layout;