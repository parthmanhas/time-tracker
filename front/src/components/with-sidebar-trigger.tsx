import { SidebarTrigger } from "./ui/sidebar";

export function WithSidebarTrigger(props: React.PropsWithChildren & { className?: string }) {
    return (
        <div className={`${props.className || ''} flex items-center gap-2`}>
            <SidebarTrigger />
            {props.children}
        </div>
    )
}