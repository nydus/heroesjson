cmake_minimum_required (VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

set ( CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Wunreachable-code -Wpedantic -Wformat=2 -std=c99 -O3 -march=native -D_GNU_SOURCE -fshort-enums -ftrapv -Wfloat-equal -Wundef -Wshadow -Wpointer-arith -Wcast-align -Wstrict-prototypes -Wno-unused-parameter -Wno-missing-field-initializers -D_DEFAULT_SOURCE" )

set ( CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -g3" )
# -fno-omit-frame-pointer -fsanitize=address

#RELEASE BUILD: cmake -DCMAKE_BUILD_TYPE=Release ..
#  DEBUG BUILD: cmake -DCMAKE_BUILD_TYPE=Debug ..

set(cascextract_srcs
	cascextract.c
	main.c
)

add_executable(cascextract ${cascextract_srcs})

find_library(CASC_LIBRARY casc ../../CascLib-build/)
target_link_libraries(cascextract "-lm ${CASC_LIBRARY}")

set(CMAKE_EXE_LINKER_FLAGS "-Wl,-rpath,../../CascLib-build/")
