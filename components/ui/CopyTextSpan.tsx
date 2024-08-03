import React, { useState } from 'react';

const CopyTextSpan = ({ post } : { post: any }) => {
    const [clicked, setClicked] = useState(false);

    return (
        <span
            onClick={(event) => {
                event.stopPropagation();
                if (!clicked) {
                    setClicked(true);
                    const element = event.currentTarget;
                    element.classList.add('green-text');
                    navigator.clipboard.writeText(post.prompt);
                    setTimeout(() => {
                        if (element) {
                            element.classList.remove('green-text');
                            setClicked(false);
                        }
                    }, 2000);
                } else {
                    navigator.clipboard.writeText(post.prompt);
                }
            }}
            className='h-7 w-full m-1 p-1 text-xs text-white/70 hover:text-white transition-all z-20 select-none'
        >
            {truncateText(post.prompt, 40)}
        </span>
    );
};

export default CopyTextSpan;

function truncateText(text:string, length:number) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}
