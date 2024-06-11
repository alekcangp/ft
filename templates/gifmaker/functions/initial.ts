'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    return {
        buttons: [{ label: `${config.label}`, action: 'link', target: `${config.link}` }],
        image: config.gif,
        fonts: roboto,
    }
}
