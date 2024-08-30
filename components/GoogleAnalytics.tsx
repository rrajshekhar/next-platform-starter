// components/GoogleAnalytics.tsx
'use client';

import Script from 'next/script'
import {pageview} from "../lib/gtagHelper"
import {usePathname} from 'next/navigation'
import { useEffect, useState } from "react";

export default function GoogleAnalytics({GA_MEASUREMENT_ID} : {GA_MEASUREMENT_ID : string}){
    const pathname = usePathname()
    const [myCookie, setMyCookie] = useState(null);

    useEffect(() => {
        if (typeof document !== 'undefined') {
          const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('edge_redirect='))
            ?.split('=')[1];
          setMyCookie(cookieValue);
        }
      }, []);

    useEffect(() => {
        const url = pathname;
        if(myCookie === 'ssc'){
            pageview(GA_MEASUREMENT_ID, url);
        }   
    }, [pathname]);

    return (
        <>
            <Script strategy="afterInteractive" 
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}/>
            <Script id='google-analytics' strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('consent', 'default', {
                    'analytics_storage': 'denied'
                });
                
                gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                });
                `,
                }}
            />
        </>
)}
