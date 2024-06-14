'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { useRef,useState,useEffect } from 'react'
import type { Config } from '.'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const videoRef = useRef<HTMLImageElement | null>(null)
    const logs = useRef(null)
    const ffmpegRef = useRef(new FFmpeg())
    const [file, setFile] = useState<File>()
 
    const load = async () => {
      
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        const ffmpeg = ffmpegRef.current
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        })
        logs.current.value = 'Ready!'
      }

      setTimeout(load,1000)

      const transcode = async () => {
        try {
        logs.current.value = 'Downloading video file . . .'
        const ffmpeg = ffmpegRef.current
        // u can use 'https://ffmpegwasm.netlify.app/video/video-15s.avi' to download the video to public folder for testing
        await ffmpeg.writeFile('input.avi', await fetchFile(file))
      //"-vf","drawtext=fontfile=/arial.ttf:text=Artist:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2",
        await ffmpeg.writeFile('arial.ttf', await fetchFile('https://raw.githubusercontent.com/alekcangp/frametrain/master/arial.ttf'))
        logs.current.value = 'Creating GIF . . .'
        ffmpeg.exec(["-i","input.avi","-t","2","-vf","drawtext=fontfile=arial.ttf:text=Artist:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2", "output.gif"]);

        const data = (await ffmpeg.readFile('output.gif')) as any
        var b64 = Buffer.from(data).toString('base64');

        const { filePath } = await uploadImage({
           base64String: b64,
            contentType: 'image/gif',
        })
        const gifUrl = process.env.NEXT_PUBLIC_CDN_HOST+'/'+filePath;
        console.log(gifUrl);
        logs.current.value = `Ready! Gif's URL: ${gifUrl}`

        if (videoRef.current){
           // const urll = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
           // console.log(urll)
            videoRef.current.src = gifUrl
          
        }
    }catch(e) {
        logs.current.value = `Something went wrong. Try again: ${JSON.stringify(e)}`
    }
             
      }

    const { gif, video, link, label, start, finish, caption, fontsize, fps, scale } = config

    const inputVideoUrl = useRef<HTMLInputElement>(null)
    const inputStart = useRef<HTMLInputElement>(null)
    const inputFinish = useRef<HTMLInputElement>(null)
    const inputCaption = useRef<HTMLInputElement>(null)
    const inputFontSize = useRef<HTMLInputElement>(null)
    const inputFps = useRef<HTMLInputElement>(null)
    const inputScale = useRef<HTMLInputElement>(null)
    const inputButtonLabel = useRef<HTMLInputElement>(null)
    const inputButtonLink = useRef<HTMLInputElement>(null)
    

    const confDefault = {
        gif: 'https://i.postimg.cc/fLRwTKnF/roboto.gif',
        video: 'https://www.youtube.com/watch?v=DYCIlghl5rI',
        start: 15,
        finish: 20,
        caption: 'Hello from FrameTrain',
        fontsize: 20,
        fps: 10,
        scale: 320,
        label: 'VIEW',
    }

    
    useEffect(() => {
        if (!file) return

       console.log(file)
      // transcode()
    }, [file])

    return (
        <div className="w-full h-full space-y-4">
            <h1 className="text-lg font-semibold">GIF Maker</h1>

            <p>Simple hit 'Create GIF' button.</p>

            <p>
                Note: The created gif's size should be less 10 MB to publish to Farcaster. The recommended video size is less 30MB.
            </p>

            <label
                        htmlFor="uploadFile"
                        className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                    >
                        Upload a file
                        <Input
                            id="uploadFile"
                            accept="video/avi"
                            type="file"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setFile(e.target.files?.[0])
                                    
                                }
                            }}
                            className="sr-only"
                        />
                    </label>

            <h3 className="text-lg font-semibold">Enter parameters</h3>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Youtube URL (default: https://www.youtube.com/watch?v=DYCIlghl5rI)"
                    ref={inputVideoUrl}
                />
                <Input
                    className="text-lg"
                    placeholder="Start time in sec (default: 15)"
                    ref={inputStart}
                />
                <Input
                    className="text-lg"
                    placeholder="Finish time in sec (default: 20)"
                    ref={inputFinish}
                />
                <Input
                    className="text-lg"
                    placeholder="Caption (default: Hello from FrameTrain)"
                    ref={inputCaption}
                />
                <Input
                    className="text-lg"
                    placeholder="Font size (default: 20)"
                    ref={inputFontSize}
                />
                <Input className="text-lg"
                     placeholder="FPS (default: 10)"
                     ref={inputFps}
                />
                <Input className="text-lg"
                     placeholder="Scale (default: 320)"
                     ref={inputScale}
                />
                <Input
                    className="text-lg"
                    placeholder="Button label (default: VIEW)"
                    ref={inputButtonLabel}
                />
                <Input
                    className="text-lg"
                    placeholder="Button link (default: Video URL + Start time)"
                    ref={inputButtonLink}
                />
                <img ref={videoRef} ></img>
                <br />
                <button onClick={transcode} className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded">
                 Preview
                </button>
                Console: <textarea style={{ color: '#00FFFF' }} ref={logs}></textarea>
                
                <Button
                    onClick={async () => {
                        const params = {
                            video: inputVideoUrl.current?.value || confDefault.video,
                            start: inputStart.current?.value || confDefault.start,
                            finish: inputFinish.current?.value || confDefault.finish,
                            caption: inputCaption.current?.value || confDefault.caption,
                            fontsize: inputFontSize.current?.value || confDefault.fontsize,
                            fps: inputFps.current?.value || confDefault.fps,
                            scale: inputScale.current?.value || confDefault.scale,
                            label: inputButtonLabel.current?.value || confDefault.label,
                            link: inputButtonLink.current?.value || inputVideoUrl.current?.value + '#t=' + inputStart.current?.value,
                        }

                        //updateConfig({ gif: confDefault.gif });
                        logs.current.value = 'Downloading video and creating Gif. Please, wait . . .'

                        //fetch gif url ...
                        try {
                            const resp = await fetch(
                                `https://87.251.66.40/api?url=${params.video}&start=${params.start}&finish=${params.finish}&caption="${params.caption}"&fontsize=${params.fontsize}&fps=${params.fps}&scale=${params.scale}`
                            )
                            const data = await resp.json()
                            console.log(data.url)

                            if (data.url == confDefault.gif) {
                                logs.current.value = 'Something went wrong. Check params and try again.'
                            } else {
                                logs.current.value = `Complited! ${data.url}`
                            }

                            updateConfig({
                                gif: data.url,
                                video: params.video,
                                start: params.start,
                                finish: params.finish,
                                caption: params.caption,
                                fontsize: params.fontsize,
                                fps: params.fps,
                                scale: params.scale,
                                label: params.label,
                                link: params.link,
                            })
                        } catch (e) {
                            logs.current.value = `Something went wrong. Check params and try again. ${e}`
                        }
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                Create GIF
            </Button>
            </div>

            <Button
                className="w-full"
                onClick={() => {

                    inputVideoUrl.current.value = config.video || confDefault.video
                    inputStart.current.value = config.start || confDefault.start
                    inputFinish.current.value = config.finish || confDefault.finish
                    inputCaption.current.value = config.caption || confDefault.caption
                    inputFontSize.current.value = config.fontsize || confDefault.fontsize
                    inputFps.current.value = config.fps || confDefault.fps
                    inputScale.current.value = config.scale || confDefault.scale
                    inputButtonLabel.current.value = config.label || confDefault.label
                    inputButtonLink.current.value = config.link || confDefault.video + '#t=' + confDefault.start;

                    logs.current.value = 'Success!'
                }}
            >
                Paste pre-saved
            </Button>

            <Button
                variant="destructive"
                className="w-full "
                onClick={() => {
                    updateConfig({
                        video: null,
                        link: confDefault.video,
                        label: confDefault.label,
                        gif: confDefault.gif,
                        start: null,
                        finish: null,
                        caption: null,
                        fontsize: null,
                        fps: null,
                        scale: null,
                    })

                    logs.current.value = 'The frame has been reseted.'
                }}
            >
                Reset
            </Button>
        </div>
    )
}
