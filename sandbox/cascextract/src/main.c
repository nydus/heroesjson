#include "cascextract.h"

#include <unistd.h>

Config gConfig;

static void usage(void)
{
	fprintf(stderr,
			"cascextract %s\n"
			"\n"
			"Usage: cascextract [OPTIONS] /path/to/game/\n"
			"  -h, --help              Output this help and exit\n"
			"  -V, --version           Output version and exit\n"
			"\n", CASCEXTRACT_VERSION);
	exit(EXIT_FAILURE);
}

static void parse_options(int argc, char **argv)
{
	int i;

	for(i=1;i<argc;i++)
	{
		//int lastarg = i==argc-1;

		if(!strcmp(argv[i],"-h") || !strcmp(argv[i], "--help"))
		{
			usage();
		}
		else if(!strcmp(argv[i],"-V") || !strcmp(argv[i], "--version"))
		{
			printf("cascextract %s\n", CASCEXTRACT_VERSION);
			exit(EXIT_SUCCESS);
		}
		else
		{
			break;
		}
	}

	argc -= i;
	argv += i;

	if(argc==0)
		usage();

	gConfig.dataPath = argv[0];
}

int main(int argc, char ** argv)
{
	parse_options(argc, argv);

	cascextract();

	return EXIT_SUCCESS;
}
