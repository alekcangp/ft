"use client";
import { Button } from "@/components/shadcn/Button";
import { Input } from "@/components/shadcn/Input";
import { useFrameConfig, useFrameId } from "@/sdk/hooks";
import { useRef } from "react";
import type { Config } from ".";

export default function Inspector() {
  const frameId = useFrameId();
  const [config, updateConfig] = useFrameConfig<Config>();

  const {
    gif,
    video,
    link,
    label,
    start,
    finish,
    caption,
    fontsize,
    fps,
    scale,
  } = config;

  const inputVideoUrl = useRef<HTMLInputElement>(null);
  const inputStart = useRef<HTMLInputElement>(null);
  const inputFinish = useRef<HTMLInputElement>(null);
  const inputCaption = useRef<HTMLInputElement>(null);
  const inputFontSize = useRef<HTMLInputElement>(null);
  const inputFps = useRef<HTMLInputElement>(null);
  const inputScale = useRef<HTMLInputElement>(null);
  const inputButtonLabel = useRef<HTMLInputElement>(null);
  const inputButtonLink = useRef<HTMLInputElement>(null);
  const status = useRef("Waiting for user...");

  const confDefault = {
    gif: "https://i.postimg.cc/fLRwTKnF/roboto.gif",
    video: "https://www.youtube.com/watch?v=DYCIlghl5rI",
    start: 15,
    finish: 20,
    caption: "Hello from FrameTrain",
    fontsize: 20,
    fps: 10,
    scale: 320,
    label: "VIEW",
  };

  return (
    <div className="w-full h-full space-y-4">

      <h1 className="text-lg font-semibold">GIG Maker</h1>

      <p>
        Note: Please be patient while the GIF is been creating, approx 10-30 sec. The size of the GIF should be less 10 MB.
      </p>

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

        <Input
          className="text-lg"
          placeholder="FPS (default: 10)"
          ref={inputFps}
        />

        <Input
          className="text-lg"
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
          placeholder="Button link (default: video url)"
          ref={inputButtonLink}
        />

        <h1>Status: {status.current}</h1>

        <Button
          onClick={async () => {
            //  updateConfig({ gif: confDefault.gif });

            const params = {
              video: inputVideoUrl.current?.value || confDefault.video,
              start: inputStart.current?.value || confDefault.start,
              finish: inputFinish.current?.value || confDefault.finish,
              caption: inputCaption.current?.value || confDefault.caption,
              fontsize: inputFontSize.current?.value || confDefault.fontsize,
              fps: inputFps.current?.value || confDefault.fps,
              scale: inputScale.current?.value || confDefault.scale,
              label: inputButtonLabel.current?.value || confDefault.label,
              link:
                inputButtonLink.current?.value || inputVideoUrl.current?.value,
            };

            updateConfig({ gif: confDefault.gif });
            status.current = "Downloading video and making Gif...";

            //fetch gif url ...
            try {
              const resp = await fetch(
                `https://87.251.66.40/api?url=${params.video}&start=${params.start}&finish=${params.finish}&caption="${params.caption}"&fontsize=${params.fontsize}&fps=${params.fps}&scale=${params.scale}`,
              );
              const data = await resp.json();
              console.log(data.url);

              status.current = `Complited! ${data.url}`;

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
              });
            } catch (e) {
              status.current =
                "Something went wrong. Check params and try again.";
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
          inputVideoUrl.current.value = config.video || confDefault.video;
          inputStart.current.value = config.start || confDefault.start;
          inputFinish.current.value = config.finish || confDefault.finish;
          inputCaption.current.value = config.caption || confDefault.caption;
          inputFontSize.current.value = config.fontsize || confDefault.fontsize;
          inputFps.current.value = config.fps || confDefault.fps;
          inputScale.current.value = config.scale || confDefault.scale;
          inputButtonLabel.current.value = config.label || confDefault.label;
          inputButtonLink.current.value = config.link || confDefault.video;
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
          });

          status.current = "Template has been reseted.";
        }}
      >
        Reset
      </Button>
    </div>
  );
}
