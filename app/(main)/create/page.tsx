"use client";

import { useEffect, useState, FormEvent } from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { PlaceholdersAndVanishInput } from "@/components/ui/input-vanisher";
import { qualityPrompt } from "@/utils";
import { InputApiKey } from "@/components/input-apikey";
import { usePromptConfigStore } from "@/store/prompt-config";
import { placeholders } from "@/utils";
import { getSession } from "@/app/api/session/getSession";
import sdk, { VM } from '@stackblitz/sdk';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, LoaderIcon, UploadCloud } from "lucide-react";
import JSZip from "jszip";
import saveAs from "file-saver";
import { useUIStore } from "@/store/ui-store";
import * as Tooltip from "@radix-ui/react-tooltip";
import { addPost } from "@/app/api/posts/addPost";
import { getUser } from "@/app/api/users/getUser";

export default function Page() {
	const [generation, setGeneration] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [userInput, setUserInput] = useState("")
	const [files, setFiles] = useState<any>(null)
	const [aiResponse, setAiResponse] = useState("")
	const [time, setTime] = useState(true)
	const promptConfig = usePromptConfigStore((state) => state.promptConfig)
	const techStack = usePromptConfigStore((state) => state.promptConfig.tech__stack)
	const api = usePromptConfigStore((state) => state.api)
	const closeSideMenu = useUIStore((state) => state.closeSideMenu);

	let vm: VM

	const handleDownload = async () => {
		setIsLoading(true)
		const zip = new JSZip();

		if(!vm) return setIsLoading(false);

		// Define archivos y su contenido de manera dinámica
		const files_ = await vm.getFsSnapshot();

		// Añadir archivos al ZIP
		for (const [fileName, fileContent] of Object.entries(JSON.stringify(files_))) {
			zip.file(fileName, fileContent as string | Blob | Uint8Array | ArrayBuffer);
		}

		// Generar el archivo ZIP y descargarlo
		zip.generateAsync({ type: 'blob' }).then((content) => {
			saveAs(content, promptConfig.landing__name.toLowerCase().split(' ').join('-') || 'landx-page-' + Math.floor(Math.random() * 9999) + '-by-' + localStorage.getItem('username') + '.zip');
			setIsLoading(false)
		});
	};

	const handlePublish = async () => {
		setIsLoading(true)
		try {
			let session = await getSession(localStorage.getItem('session')!!)
			let u = await getUser(session.sessionInfo!!);
			if(!vm) return setIsLoading(false);

			// Define archivos y su contenido de manera dinámica
			const files_ = await vm.getFsSnapshot();

			await addPost({
				author: u.user?.$id,
				name: promptConfig.landing__name,
				pfp: u?.user?.pfp || '/unknown.png',
				description: promptConfig.landing__description,
				data: JSON.stringify(files_),
				colors: promptConfig.style__colors,
				fonts: promptConfig.style__fontFamilies,
				font__weight: promptConfig.style__fontWeight.toString(),
				page__style: promptConfig.style__landingDesign,
				stack: promptConfig.tech__stack,
				prompt: userInput
			})

			window.location.assign('/dashboard')
		} catch (error) {
			console.error('Failed to post: '+ error)
			setIsLoading(false)
		}
	}

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		closeSideMenu();

		const prompt = qualityPrompt({
			userInput: userInput,
			landingName: promptConfig.landing__name,
			landingDescription: promptConfig.landing__description,
			email: promptConfig.user__email,
			callToActionName: promptConfig.landing__CTA,
			colors: promptConfig.style__colors,
			fontFamilies: promptConfig.style__fontFamilies,
			fontWeight: promptConfig.style__fontWeight,
			landingStyle: promptConfig.style__landingDesign,
			techStack: promptConfig.tech__stack,
		});

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					api,
					techStack,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const json = await response.json();
			setAiResponse(json);
			setGeneration(json.text);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const retrieveStack = (stack : string) => {
		switch (stack) {
			case "React": 
				return "create-react-app"
			case "Vanilla":
				return "node"
			default:
				return "node"
		}
	} 

	const embedProject = async () => {
		try {
			if (files) {
				vm = await sdk.embedProject(
					'embed',
					{
						title: promptConfig.landing__name,
						description: userInput,
						template: retrieveStack(promptConfig.tech__stack),
						files: files,
						settings: {
							compile: {
								trigger: 'auto',
								clearConsole: false,
							}
						}
					},
					{
						clickToLoad: false,
						terminalHeight: 50,
						height: 550,
						width: 'auto',
						theme: localStorage.getItem('theme') === 'dark' || localStorage.getItem('theme') === 'system' ? 'dark' : 'light'
					}
				);
				
			}
		} catch (error) {
			console.error('Error embedding project:', error);
		}
	};

	useEffect(() => {
		async function c() {
			const result = await getSession(localStorage.getItem('session')!!)
			if (result.session === false) window.location.assign('/login')
		}
		c()
	}, [])

	useEffect(() => {
		if (aiResponse) {
			fetch('/api/create-files', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ generation: generation + '\n```', promptConfig: promptConfig, author: crypto.randomUUID().toString() }),
			})
				.then(response => response.json())
				.then((data) => { setFiles(data); })
				.catch(error => { throw new Error(error) });
		}
	}, [aiResponse]);

	useEffect(() => {
		if (files) {
			embedProject()
		}
	}, [files])

	return (
		<>
			<main className="flex w-full h-full pt-15 flex-col items-center justify-center overflow-x-hidden">
				{
					files
					&& (
						<div className="z-[998] absolute top-0 bg-black/5 overflow-x-hidden w-full pt-24 pb-5">
							<div className="flex w-full mb-2">
								<div className="mx-auto flex">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button onClick={() => { window.location.reload() }} className='flex m-1' variant={'outline'}>
													<ArrowLeft className='h-5 w-5' />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content className="z-[999]" side="bottom">
													<Tooltip.Arrow className="opacity-40" />
													<span className="bg-black/40 text-white m-1 p-[0.17em] px-2 rounded-lg">Delete and go back</span>
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>
									</Tooltip.Provider>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button disabled={isLoading} className='flex m-1' onClick={handleDownload} variant={'outline'}>
													{
														isLoading ? (
															<LoaderIcon className='animate-spin h-5 w-5' />
														) : (
															<Download className='h-5 w-5' />
														)
													}
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content className="z-[999]" side="bottom">
													<Tooltip.Arrow className="opacity-40" />
													<span className="bg-black/40 text-white m-1 p-[0.17em] px-2 rounded-lg">Download Project</span>
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>
									</Tooltip.Provider>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button disabled={isLoading} className='flex m-1' onClick={handlePublish} variant={'outline'}>
													{
														isLoading ? (
															<LoaderIcon className='animate-spin h-5 w-5' />
														) : (
															<UploadCloud className='h-5 w-5' />
														)
													}
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content className="z-[999]" side="bottom">
													<Tooltip.Arrow className="opacity-40" />
													<span className="bg-black/40 text-white m-1 p-[0.17em] px-2 rounded-lg">Publish Project</span>
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>
									</Tooltip.Provider>
								</div>
							</div>
							<div className='w-[80%] mx-auto rounded-lg overflow-hidden' id={'embed'}></div>
						</div>
					)
				}
				{
					isLoading
					&&
					<p className="h-1 pb-10">Loading...</p>
				}
				{
					!files
					&& (
						<>
							<h1 className="mb-10 outlinedLabel text-transparent shadow-white">Input your vision.</h1>
							<PlaceholdersAndVanishInput
								placeholders={placeholders}
								onChange={(e: any) => setUserInput(e.target.value)}
								onSubmit={(event: any) => {
									if (time) {
										setTime(false);
										onSubmit(event);
										setTimeout(() => {
											setTime(true);
										}, 3000);
									}
								}}
							></PlaceholdersAndVanishInput>
							<InputApiKey />
							<p className="text-xs opacity-30 mt-3">Click on the right-pointed arrow to save your api key.</p>
						</>
					)
				}
				<BackgroundBeams className="z-[-2]" />
			</main>
		</>
	);
}
