import React, { useState, useEffect } from 'react';
import { FormData } from "@/types";
import * as Tooltip from "@radix-ui/react-tooltip";
import Link from 'next/link';

interface Props {
	sectionSelected: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onFormChange: (e: any) => void;
	formData: FormData;
}

const fonts = [
	'Arial',
	'Verdana',
	'Helvetica',
	'Times New Roman',
	'Courier New',
	'Georgia',
	'Palatino',
	'Garamond',
	'Comic Sans MS',
	'Trebuchet MS',
	'Arial Black',
	'Impact'
];

export function Form({ sectionSelected, onFormChange, formData }: Props) {
	const [colors, setColors] = useState<string[]>(formData.style__colors);
	const [selectedFonts, setSelectedFonts] = useState<string[]>(formData.style__fontFamilies);

	useEffect(() => {
		setColors(formData.style__colors);
	}, [formData.style__colors]);

	useEffect(() => {
		setSelectedFonts(formData.style__fontFamilies);
	}, [formData.style__fontFamilies]);

	const handleColorChange = (index: number, value: string) => {
		const newColors = [...colors];
		newColors[index] = value;
		setColors(newColors);
		onFormChange({ target: { name: 'style__colors', value: newColors } });
	};

	const addColor = () => {
		if (colors.length < 5) {
			const newColors = [...colors, '#000000'];
			setColors(newColors);
			onFormChange({ target: { name: 'style__colors', value: newColors } });
		}
	};

	const removeColor = (index: number) => {
		if (colors.length > 2) {
			const newColors = colors.filter((_, i) => i !== index);
			setColors(newColors);
			onFormChange({ target: { name: 'style__colors', value: newColors } });
		}
	};

	const handleFontChange = (index: number, value: string) => {
		const newFonts = [...selectedFonts];
		newFonts[index] = value;
		setSelectedFonts(newFonts);
		onFormChange({ target: { name: 'style__fontFamilies', value: newFonts } });
	};

	const addFont = () => {
		if (selectedFonts.length < 3) {
			const newFonts = [...selectedFonts, fonts[0]];
			setSelectedFonts(newFonts);
			onFormChange({ target: { name: 'style__fontFamilies', value: newFonts } });
		}
	};

	const removeFont = (index: number) => {
		if (selectedFonts.length > 1) {
			const newFonts = selectedFonts.filter((_, i) => i !== index);
			setSelectedFonts(newFonts);
			onFormChange({ target: { name: 'style__fontFamilies', value: newFonts } });
		}
	};

	return (
		<form className="sideBarOverflow pr-2 overflow-auto h-[60vh]">
			{sectionSelected === "business" && (
				<fieldset className="flex flex-col gap-4">
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Name</span>
						<input
							className="h-[48px] py-2 px-6 rounded-sm"
							name="landing__name"
							value={formData.landing__name}
							onChange={onFormChange}
							type="text"
							placeholder="Acme Corporation"
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Description</span>
						<textarea
							className="h-[115px] py-2 px-6 rounded-sm resize-none"
							name="landing__description"
							value={formData.landing__description}
							onChange={onFormChange}
							placeholder="Make your vignettes more fun using Acme, the simplest and fastest tool on the market."
						></textarea>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Email</span>
						<input
							className="h-[48px] py-2 px-6 rounded-sm"
							name="user__email"
							value={formData.user__email}
							onChange={onFormChange}
							type="email"
							placeholder="example@acme.com"
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Call To Action</span>
						<input
							className="h-[48px] py-2 px-6 rounded-sm"
							name="landing__CTA"
							value={formData.landing__CTA}
							onChange={onFormChange}
							type="text"
							placeholder="Join now!"
						/>
					</label>
				</fieldset>
			)}
			{sectionSelected === "style" && (
				<fieldset className="flex flex-col gap-4">
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<span onClick={()=>{window.open('https://ai11y.vercel.app/', '_blank', 'noopener,noreferrer')}} className="w-5 h-5 rounded-full border-solid border-black">
									Help with <strong className="font-normal text-violet-500 dark:text-violet-600">colors</strong>?
								</span>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content className="z-[98]" side="bottom">
									<Tooltip.Arrow className="opacity-70 dark:opacity-40 z-[98]" />
									<span className="bg-black/70 dark:bg-black/40 text-white m-1 p-[0.17em] px-2 rounded-lg">Try <strong className='font-normal text-violet-400 dark:text-violet-600'>ai11y</strong> for good contrast colors ideas!</span>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
					</Tooltip.Provider>
					<div className="m-auto grid grid-cols-3 justify-between gap-2 ">
						{colors.map((color, index) => (
							<label key={index} className="flex flex-col items-center gap-2 w-max m-2">
								<span className="text-sm text-gray-600 font-bold">Color {index + 1}</span>
								<div className="flex items-center gap-2">
									<input
										className="colorSelector w-10 h-10 p-[2px] rounded-sm hover:cursor-cell bg-transparent"
										name={`style__colors[${index}]`}
										value={color}
										onChange={(e) => handleColorChange(index, e.target.value)}
										type="color"
									/>
									{colors.length > 2 && (
										<button
											type="button"
											onClick={() => removeColor(index)}
											className="w-6 h-6 transition-all bg-white hover:bg-white/40 dark:bg-white/20 dark:hover:bg-white/40 text-black dark:text-white rounded-full flex items-center justify-center hover:cursor-pointer"
										>
											&times;
										</button>
									)}
								</div>
							</label>
						))}
					</div>
					{colors.length < 5 && (
						<button
							type="button"
							onClick={addColor}
							className="w-32 h-6 m-auto transition-all bg-white hover:bg-white/40 dark:bg-white/20 dark:hover:bg-white/40 text-black dark:text-white rounded-full flex items-center justify-center hover:cursor-pointer"
						>
							+
						</button>
					)}
					<label className="flex flex-col gap-2 mx-auto w-full">
						<span className="text-sm text-gray-600 font-bold">Font</span>
						{selectedFonts.map((font, index) => (
							<div key={index} className="flex items-center gap-2">
								<select
									className="w-full h-[48px] py-2 px-6 rounded-sm"
									name={`style__fontFamilies[${index}]`}
									value={font}
									style={{ fontFamily: font, fontWeight: formData.style__fontWeight }}
									onChange={(e) => handleFontChange(index, e.target.value)}
								>
									{fonts.map((fontOption, idx) => (
										<option key={idx} style={{ fontFamily: fontOption, fontWeight: formData.style__fontWeight }} value={fontOption}>
											{fontOption}
										</option>
									))}
								</select>
								{selectedFonts.length > 1 && (
									<button
										type="button"
										onClick={() => removeFont(index)}
										className='w-6 h-6 transition-all bg-white hover:bg-white/40 dark:bg-white/20 dark:hover:bg-white/40 text-black dark:text-white rounded-full flex items-center justify-center hover:cursor-pointer'
									>
										&times;
									</button>
								)}
							</div>
						))}
						{selectedFonts.length < 3 && (
							<button
								type="button"
								onClick={addFont}
								className="w-32 h-6 m-auto transition-all bg-white hover:bg-white/40 dark:bg-white/20 dark:hover:bg-white/40 text-black dark:text-white rounded-full flex items-center justify-center hover:cursor-pointer"
							>
								Add font
							</button>
						)}
						<span className="text-sm text-gray-600 font-bold">Weight ({formData.style__fontWeight})</span>
						<input
							min={100}
							max={900}
							step={100}
							name="style__fontWeight"
							type="range"
							value={formData.style__fontWeight}
							onChange={onFormChange}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Page style</span>
						<select
							className="w-full h-[48px] py-2 px-6 rounded-sm"
							name="style__landingDesign"
							value={formData.style__landingDesign}
							onChange={onFormChange}
						>
							<option value="minimalist">Minimalist (Recommended)</option>
							<option value="futuristic">Futuristic</option>
							<option value="old school">Classic</option>
						</select>
					</label>
				</fieldset>
			)}
			{sectionSelected === "tech" && (
				<fieldset className="flex flex-col gap-4">
					<label className="flex flex-col gap-2">
						<span className="text-sm text-gray-600 font-bold">Tech Stack</span>
						<select
							className="w-full h-[48px] py-2 px-6 rounded-sm"
							value={formData.tech__stack}
							name="tech__stack"
							onChange={onFormChange}
						>
							<option value="React">React (Recommended)</option>
							<option value="Vanilla">Vanilla</option>
						</select>
					</label>
				</fieldset>
			)}
		</form>
	);
}
