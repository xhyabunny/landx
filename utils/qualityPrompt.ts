export const qualityPrompt = ({
  userInput,
  landingName,
  landingDescription,
  email,
  callToActionName,
  colors,
  fontFamilies,
  fontWeight,
  landingStyle,
  techStack,
}: {
  userInput: string | "";
  landingName: string | "";
  email: string | undefined | null | "";
  landingDescription: string | "";
  callToActionName: string | "";
  colors: string[];
  fontFamilies: string[];
  fontWeight: number;
  landingStyle: string;
  techStack: string;
}) => {
  return `Hi, im user-${crypto.randomUUID}.
I need you to create a brand new landing page:
- Do not repeat the same landing page over and over, send somethign new, and respect every single thing in this list
- The page is going to be made using the ${techStack} framework.
- Name should be “${landingName === '' ? "anything you want, as long as it fits to what im asking" : landingName}”, this will be used for the title and the page name. 
- The description should be ${landingDescription === '' ? "anything you want, as long as it fits to what im asking" : 'exact and with no changes: “'+landingDescription+'”'}.
- You should use the fonts “${fontFamilies}” so make sure to add them in to the CSS styles, the fonts should have weights of ${fontWeight}, you can vary a bit on it depending on how big the texts should be.
- I need ${colors.length} to be used: ${colors.join(", ")}, but you can adjust and change them a bit to ensure things like text or buttons are visible according to the background.
- I want the page to look ${landingStyle} and this should be the aesthetic of the page in general, please variate in designs.
- The call to action button ${callToActionName === '' ? 'can say anything you want, as long as it fits what im asking' : + "must say “"+callToActionName.toString()+"” and nothing else"}.
${email === '' || email === null || email === undefined ? `` : `- Also make a footer (according to the mentioned styles) that contains “${email}” for contact info.`}`
}

export default qualityPrompt;
