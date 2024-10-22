import { useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { usePromptConfigStore } from "@/store/prompt-config";

export function InputApiKey() {
	const [apiKey, setApiKey] = useState("");
	const [api, setApi] = useState("OpenAI");
	const [visible, setVisible] = useState(false);
	const saveApi = usePromptConfigStore((state) => state.saveApi);
	const arrow = useRef<SVGSVGElement>(null)

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (api.trim() === "" || apiKey.trim() === "") return;
		saveApi({ apiProvider: api, apiKey: apiKey });
	}

	const handleAnim = () => {
		if (!arrow.current) return 
		arrow.current.style.rotate = '-90deg'
		arrow.current.style.backgroundColor = '#77FF88'
		setTimeout(()=>{
			arrow!!.current!!.style.rotate = '0deg'
			arrow!!.current!!.style.backgroundColor = 'transparent'
		}, 1000)
	}

	return (
		<form
			onSubmit={onSubmit}
			className="flex relative max-w-xl mx-auto bg-white/40 dark:bg-zinc-800/40 h-9 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 mt-5"
		>
			{!visible ? (
				<EyeOffIcon
					className="mt-[0.55em] ml-[1em] size-4 cursor-pointer z-20"
					onClick={() => {
						setVisible((prev) => !prev);
					}}
				></EyeOffIcon>
			) : (
				<EyeIcon
					className="mt-[0.55em] ml-[1em] size-4 cursor-pointer z-20"
					onClick={() => {
						setVisible((prev) => !prev);
					}}
				></EyeIcon>
			)}
			<input
				type={visible ? "text" : "password"}
				placeholder="Custom API Key"
				className="relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-3"
				onChange={(e) => setApiKey(e.target.value)}
				value={apiKey}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<span className="mt-1.5 w-28 text-end cursor-pointer relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0">
						{api} ↓
					</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="outline-none cursor-pointer bg-white/10 dark:bg-white/20 rounded-md overflow-hidden"
					align="end"
				>
					<DropdownMenuItem
						className="outline-none cursor-pointer bg-white/30 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-white/20 p-2 px-3"
						onClick={() => {
							setApi("OpenAI");
						}}
					>
						OpenAI
					</DropdownMenuItem>
					<DropdownMenuItem
						className="outline-none cursor-pointer bg-white/30 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-white/20 p-2 px-3"
						onClick={() => {
							setApi("GROQ");
						}}
					>
						GROQ
					</DropdownMenuItem>
					<DropdownMenuItem
						className="outline-none cursor-pointer bg-white/30 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-white/20 p-2 px-3"
						onClick={() => {
							setApi("Llama3");
						}}
					>
						Llama3
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<button type="submit" className="px-3">
				<ArrowRightIcon ref={arrow} onClick={handleAnim} className="w-4 h-4 transition-all rounded-full"></ArrowRightIcon>
			</button>
		</form>
	);
}
