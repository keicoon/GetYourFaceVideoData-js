import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--data_path", default="/data/lipnet_wild/", help="path of base dir")
parser.add_argument("--split_by_sentence", action="store_true", help="option of split video by sentence")
args = parser.parse_args()

print('data_path : {}'.format(args.data_path))
print('split_by_sentence : {}'.format(args.split_by_sentence))

file = open(args.data_path, "r") 
print(file.read())

import os
print(os.getcwd())

file2 = open('./test2.txt', 'r')
print(file2.read())