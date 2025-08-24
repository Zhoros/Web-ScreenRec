async function mixAudio(screenStream, micStream) {
	const ctx = new (window.AudioContext || window.webkitAudioContext)()
	const dest = ctx.createMediaStreamDestination()

	// Connect screen audio
	if (screenStream.getAudioTracks().length > 0) {
	const screenSource = ctx.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]))
	screenSource.connect(dest)
	}

	// Connect mic audio
	if (micStream.getAudioTracks().length > 0) {
	const micSource = ctx.createMediaStreamSource(new MediaStream([micStream.getAudioTracks()[0]]))
	micSource.connect(dest)
	}

	return dest.stream
}

async function convertToMP4(webmBlob) {
	if (!ffmpegLoaded) {
		throw new Error('FFmpeg not loaded yet')
	}

	status.innerHTML = 'Converting to MP4...'

	//rite the WebM file to FFmpeg's virtual file system
	const inputName = 'input.webm'
	const outputName = 'output.mp4'
	ffmpeg.FS('writeFile', inputName, await fetchFile(webmBlob))

	//Run the FFmpeg command to convert WebM to MP4
	await ffmpeg.run('-i', inputName, '-c:v', 'libx264', '-c:a', 'aac', outputName)

	//Read the result
	const data = ffmpeg.FS('readFile', outputName)

	//Create a download link for the MP4
	const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' })
	const mp4Url = URL.createObjectURL(mp4Blob)

	status.innerHTML = 'Conversion complete!'
	return { blob: mp4Blob, url: mp4Url }
}

startBtn.onclick = async () => {

	startBtn.disabled = true
	stopBtn.disabled = false
	chunks = []
	downloadsElement.innerHTML = ''
	status.innerHTML = 'Starting recording...'

	try {

		//combine screen capture & audio
		screenStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
		if (micCheckbox.checked) {
			micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const mixedAudioStream = await mixAudio(screenStream, micStream)
			mixedStream = new MediaStream([
				...screenStream.getVideoTracks(),
				...mixedAudioStream.getAudioTracks()
			])
		} else {
			mixedStream = screenStream
		}
		//auto stop
		const screenVideoTrack = screenStream.getVideoTracks()[0];
		if (screenVideoTrack) {
			screenVideoTrack.addEventListener('ended', () => {
				if (recorder && recorder.state !== "inactive") {
					stopRecording();
				}
			});
		}

		//video preview
		preview.style.display = "block"
		preview.srcObject = mixedStream
		preview.muted = true

		recorder = new MediaRecorder(mixedStream)
		recorder.ondataavailable = e => chunks.push(e.data)
		recorder.onstop = async () => {
			status.innerHTML = 'Processing recording...'
			const webmBlob = new Blob(chunks, { type: 'video/webm' })
			preview.srcObject = null;
			preview.src = URL.createObjectURL(webmBlob)

			// Create WebM download link
			const webmLink = document.createElement('a')
			webmLink.href = preview.src
			webmLink.download = 'recording.webm'
			webmLink.textContent = 'Download WebM'
			webmLink.style.display = 'block'
			webmLink.style.margin = '0.5em 0'
			downloadsElement.appendChild(webmLink)

		try {
			const { url: mp4Url } = await convertToMP4(webmBlob)
			const mp4Link = document.createElement('a')
			mp4Link.href = mp4Url;
			mp4Link.download = 'recording.mp4'
			mp4Link.textContent = 'Download MP4'
			mp4Link.style.display = 'block'
			mp4Link.style.margin = '0.5em 0'
			downloadsElement.appendChild(mp4Link)
		} catch (error) {
			console.error('MP4 conversion failed:', error)
			status.innerHTML = 'MP4 conversion failed, WebM is available'
		}
			// Stop all media tracks
			screenStream.getTracks().forEach(track => track.stop())
			micStream.getTracks().forEach(track => track.stop())
		};

		recorder.start()
		status.innerHTML = 'Recording...'

	} catch (error) {
		console.error('Error starting recording:', error)
		status.innerHTML = 'Error: ' + error.message
		startBtn.disabled = false
		stopBtn.disabled = true
	}
};

function stopRecording() {
	startBtn.disabled = false;
	stopBtn.disabled = true;
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
    }
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop())
    }
	recorder.stop()

}

stopBtn.onclick = () => {
	stopRecording()
};

