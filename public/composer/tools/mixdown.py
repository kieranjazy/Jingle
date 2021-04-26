from scipy.io import wavfile
import numpy as np
import os
# MixDown.py - REQUIRES SCIPY
# Created by Daniel Hannon (danielh2942)
# Last Edited 26/04/2021
"""
    Outline:
    Basically since I need to mix files down to mono when I want to make wavetables
    I need to open audacity, I figured I'd cut out that step altogether and make a
    script to mix the aduio down for me.
    As of Now, Files still need to be in WAV format though!
"""


def convert_to_f32(input, channels):
    f32_array = []
    if(channels == 1):
        if(np.dtype(input[0]) == np.int32):
            print("Audio is in 24/32 bit PCM format, converting to floating point")
            for i in range(len(input)):
                # Typecasting to Standard interger format as assurance because I don't know much about numpy
                temp = int(input[i])
                # Range is [-2147483648, 2147483647] for 32 bit and
                # [-2147483648, 2147483392] for 24 so we can use the same
                # calculations for both
                if(temp < 0):
                    temp = temp / 2147483648
                else:
                    temp = temp / 2147483647
                f32_array.append(temp)
        elif(np.dtype(input[0]) == np.int16):
            print("Audio is in 16 bit PCM format, converting to floating point")
            for i in range(len(input)):
                temp = int(input[i])
                # Range is [-32768,32767]
                if(temp < 0):
                    temp = temp / 32768
                else:
                    temp = temp / 32767
                f32_array.append(temp)
        elif(np.dtype(input[0]) == np.uint8):
            print("Audio is 8 Bit PCM format, converting to floating point")
            for i in range(len(input)):
                temp = int(input[i])
                # in range [0,255]
                temp = temp - 128
                if(temp < 0):
                    temp = temp / 128
                else:
                    temp = temp / 127
                f32_array.append(temp)
        else:
            print("Already in 32 Bit float format")
            f32_array = input
    else:  # Stereo
        if(np.dtype(input[0][0]) == np.int32):
            print("Audio is in 24/32 bit PCM format, converting to floating point")
            for i in range(len(input)):
                temp = (input[i][0]/2) + (input[i][1]/2)
                # Range is [-2147483648, 2147483647] for 32 bit and
                # [-2147483648, 2147483392] for 24 so we can use the same
                # calculations for both
                if(temp < 0):
                    temp = temp / 2147483648
                else:
                    temp = temp / 2147483647
                f32_array.append(temp)
        elif(np.dtype(input[0][0]) == np.int16):
            print("Audio is in 16 bit PCM format, converting to floating point")
            for i in range(len(input)):
                temp = (input[i][0]/2) + (input[i][1]/2)
                # Range is [-32768,32767]
                if(temp < 0):
                    temp = temp / 32768
                else:
                    temp = temp / 32767
                f32_array.append(temp)
        elif(np.dtype(input[0][0]) == np.uint8):
            print("Audio is 8 Bit PCM format, converting to floating point")
            for i in range(len(input)):
                temp = (input[i][0]/2) + (input[i][1]/2)
                # in range [0,255]
                temp = temp - 128
                if(temp < 0):
                    temp = temp / 128
                else:
                    temp = temp / 127
                f32_array.append(temp)
        else:
            print("Already in 32 Bit float format")
            for i in range(len(input)):
                temp = (input[i][0]/2) + (input[i][1]/2)
                f32_array.append(temp)
    return f32_array


def mix(filename):
    audiofile = wavfile.read(filename)
    output = []
    if(audiofile[0] != 44100):
        print("File has wrong sample rate!")
        return
    try:
        len(audiofile[1][0])
        print("Stereo File")
        # Mixing Down (Each Channel is divided by two and added for a perfect 50/50 split)
        output = convert_to_f32(audiofile[1], 2)
        print("Audio Mixed Down to Mono")
    except Exception:
        print("Mono File")
        output = convert_to_f32(audiofile[1], 1)
    # Time to perform a typecheck before it is unloaded into a file
    # Possible Types Obtained from this: https://docs.scipy.org/doc/scipy/reference/generated/scipy.io.wavfile.read.html
    return output


def dumpwavetable(filename, data):
    print("Making Wave Table %s" % (filename))
    # Open in write mode
    outputfile = open(filename, "w")
    outputfile.write("[")
    for i in range(len(data)):
        outputfile.write("%.4f" % (data[i]))
        if(i != len(data) - 1):
            outputfile.write(",")
    outputfile.write("]")
    outputfile.close()
    print("Done!")


direntries = os.scandir("./input")
for entry in direntries:
    if entry.is_file():
        if entry.name.endswith(".wav"):
            print("%s" % (entry.name))
            outputdata = mix(entry.path)
            temp = "./output/" + entry.name[:-4] + ".json"
            dumpwavetable(temp, outputdata)
