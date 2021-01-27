import math
# Frequency Generator
# Final Version
# 26/01/2021 - Daniel Hannon (danielh2942)
# Basically, I'm not arsed writing any of this by hand lol
# Midi Frequencies are calculated using f(x) = 440 * 2^((x-69)/12)
# So in order to make this able to accurately traverse the wave table
# It divides the output of the given function by the frequency of the wavetable
output = open("keyfreqs.json", "w")
output.write("[")
divisor = float(input("What is the key frequency? "))
for i in range(0, 128):
    num = round((440 * math.pow(2, (i - 69)/12)/divisor), 5)
    output.write("%s," % (num))

output.write("]")
output.close()
