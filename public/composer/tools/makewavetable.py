import struct
# makewavetable.py
# Version 1
# Last Edited: 26/01/2021 by Daniel Hannon (danielh2942)

"""
    Basically, the way that the wave tables are made is that we export a
    wav file from audacity that must be as follows:
    1. Single Channel
    2. Audio samples are stored as 32 bit samples
"""

inputfile = open("input.wav", "rb")
outputfile = open("output.json", "w")

# Skip header data (WAV Header should be a fixed 44 Bytes btw)
# Sometimes Headers are larger than this for some reason, so please check
# inputs after processing
inputfile.seek(44)

outputfile.write("[")

# Basically it reads in until there's an error
while True:
    try:
        currnum = inputfile.read(4)
        mynum = struct.unpack("f", currnum)
        outputfile.write("%.4f," % (mynum))
    except:
        break

outputfile.write("]")
inputfile.close()
outputfile.close()
